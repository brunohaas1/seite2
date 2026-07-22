"""OCR API routes for document processing."""

import os
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies.auth import get_current_user
from src.api.schemas.ocr import OCRUploadResponse, OCRResultResponse, OCRConfirmRequest
from src.infrastructure.persistence.database import get_db
from src.infrastructure.persistence.models.user import User
from src.infrastructure.persistence.models.ocr import OCRDocument, OCRResult
from src.infrastructure.persistence.models.transaction import Transaction
from src.core.config import settings

ocr_router = APIRouter(prefix="/api/v1/ocr", tags=["OCR"])


@ocr_router.post("/upload", response_model=OCRUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload document for OCR processing."""
    ext = os.path.splitext(file.filename or "document")[1].lower()
    if ext not in settings.OCR_SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Supported: {settings.OCR_SUPPORTED_EXTENSIONS}",
        )

    content = await file.read()
    if len(content) > settings.OCR_MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max: {settings.OCR_MAX_FILE_SIZE_MB}MB",
        )

    filename = f"{uuid.uuid4()}{ext}"
    file_path = f"ocr/{current_user.id}/{filename}"

    doc = OCRDocument(
        user_id=current_user.id,
        filename=filename,
        original_filename=file.filename or "document",
        file_path=file_path,
        file_size=len(content),
        file_type=ext[1:] if ext else "unknown",
        mime_type=file.content_type,
    )
    db.add(doc)
    await db.flush()

    from src.infrastructure.queue.tasks import process_ocr_task
    await process_ocr_task(doc.id, content, file_path)

    return OCRUploadResponse(
        id=doc.id,
        filename=doc.original_filename,
        status="processing",
    )


@ocr_router.get("/{document_id}", response_model=OCRResultResponse)
async def get_ocr_result(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get OCR processing result."""
    result = await db.execute(
        select(OCRDocument).where(
            OCRDocument.id == document_id,
            OCRDocument.user_id == current_user.id,
        )
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    result_data = await db.execute(
        select(OCRResult).where(OCRResult.document_id == document_id)
    )
    ocr_result = result_data.scalar_one_or_none()

    return OCRResultResponse(
        id=doc.id,
        status=doc.status,
        raw_text=doc.raw_text,
        **(
            {
                "transaction_type": ocr_result.transaction_type,
                "amount": ocr_result.amount,
                "date": ocr_result.date,
                "description": ocr_result.description,
                "company_name": ocr_result.company_name,
                "confidence_score": ocr_result.confidence_score,
            }
            if ocr_result
            else {}
        ),
    )


@ocr_router.post("/{document_id}/confirm")
async def confirm_ocr(
    document_id: uuid.UUID,
    request: OCRConfirmRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Confirm OCR result and create transaction."""
    result = await db.execute(
        select(OCRDocument).where(
            OCRDocument.id == document_id,
            OCRDocument.user_id == current_user.id,
        )
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    result_data = await db.execute(
        select(OCRResult).where(OCRResult.document_id == document_id)
    )
    ocr_result = result_data.scalar_one_or_none()
    if not ocr_result:
        raise HTTPException(status_code=404, detail="OCR result not found")

    ocr_result.is_confirmed = request.is_confirmed
    if request.transaction_type:
        ocr_result.transaction_type = request.transaction_type
    if request.amount:
        ocr_result.amount = request.amount
    if request.description:
        ocr_result.description = request.description

    transaction = Transaction(
        user_id=current_user.id,
        account_id=request.account_id,
        category_id=request.category_id,
        type=request.transaction_type or "expense",
        amount=request.amount or ocr_result.amount or 0,
        description=request.description or ocr_result.description or "OCR Import",
        date=request.date or ocr_result.date or datetime.now(timezone.utc),
        due_date=request.due_date or ocr_result.due_date,
        document_number=request.document_number or ocr_result.document_number,
    )
    db.add(transaction)
    doc.status = "completed"
    await db.flush()

    return {"message": "Transaction created from OCR", "transaction_id": str(transaction.id)}


@ocr_router.get("")
async def list_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List OCR documents."""
    result = await db.execute(
        select(OCRDocument)
        .where(OCRDocument.user_id == current_user.id)
        .order_by(OCRDocument.created_at.desc())
        .limit(50)
    )
    docs = result.scalars().all()
    return [
        {
            "id": str(d.id),
            "filename": d.original_filename,
            "file_type": d.file_type,
            "status": d.status,
            "created_at": d.created_at.isoformat(),
        }
        for d in docs
    ]