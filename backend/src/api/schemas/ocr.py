"""OCR Pydantic schemas."""

from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class OCRUploadResponse(BaseModel):
    """OCR upload response schema."""

    id: UUID
    filename: str
    status: str
    message: str = "Document uploaded successfully. Processing OCR."


class OCRResultResponse(BaseModel):
    """OCR result response schema."""

    id: UUID
    status: str
    raw_text: Optional[str] = None
    transaction_type: Optional[str] = None
    amount: Optional[Decimal] = None
    date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    description: Optional[str] = None
    company_name: Optional[str] = None
    document_number: Optional[str] = None
    cnpj: Optional[str] = None
    cpf: Optional[str] = None
    payment_method: Optional[str] = None
    category: Optional[str] = None
    installments: Optional[int] = None
    bank_name: Optional[str] = None
    barcode: Optional[str] = None
    digitable_line: Optional[str] = None
    pix_key: Optional[str] = None
    confidence_score: Optional[float] = None
    is_confirmed: bool = False

    model_config = {"from_attributes": True}


class OCRConfirmRequest(BaseModel):
    """OCR confirm/edit request schema."""

    transaction_type: Optional[str] = None
    amount: Optional[Decimal] = None
    date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    description: Optional[str] = None
    company_name: Optional[str] = None
    document_number: Optional[str] = None
    payment_method: Optional[str] = None
    category_id: Optional[UUID] = None
    account_id: Optional[UUID] = None
    installments: Optional[int] = None
    is_confirmed: bool = True


class OCRListResponse(BaseModel):
    """OCR document list response."""

    id: UUID
    filename: str
    original_filename: str
    file_type: str
    status: str
    created_at: datetime
    confidence_score: Optional[float] = None

    model_config = {"from_attributes": True}