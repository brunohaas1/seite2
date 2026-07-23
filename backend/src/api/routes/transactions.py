"""Transaction API routes."""

from datetime import datetime
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies.auth import get_current_user
from src.api.schemas.transaction import (
    TransactionCreate, TransactionResponse, TransactionUpdate, TransactionFilter,
)
from src.api.schemas.common import PaginatedResponse
from src.infrastructure.persistence.database import get_db
from src.infrastructure.persistence.models.user import User
from src.infrastructure.persistence.models.transaction import Transaction
from src.infrastructure.persistence.models.category import Category

transactions_router = APIRouter(prefix="/api/v1/transactions", tags=["Transactions"])


@transactions_router.get("", response_model=PaginatedResponse[TransactionResponse])
async def list_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    start_date: datetime | None = Query(None, description="ISO datetime, inclusive"),
    end_date: datetime | None = Query(None, description="ISO datetime, inclusive"),
    type: str | None = Query(None, pattern="^(income|expense|transfer)$"),
    category_id: UUID | None = Query(None),
    account_id: UUID | None = Query(None),
    search: str | None = Query(None, max_length=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List user transactions with pagination and optional filters."""
    conditions = [
        Transaction.user_id == current_user.id,
        Transaction.is_deleted.is_(False),
    ]
    if start_date is not None:
        conditions.append(Transaction.date >= start_date)
    if end_date is not None:
        conditions.append(Transaction.date <= end_date)
    if type is not None:
        conditions.append(Transaction.type == type)
    if category_id is not None:
        conditions.append(Transaction.category_id == category_id)
    if account_id is not None:
        conditions.append(Transaction.account_id == account_id)
    if search:
        conditions.append(Transaction.description.ilike(f"%{search}%"))

    query = (
        select(Transaction)
        .where(*conditions)
        .order_by(Transaction.date.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    result = await db.execute(query)
    items = result.scalars().all()

    count_query = select(func.count()).select_from(Transaction).where(*conditions)
    count_result = await db.execute(count_query)
    total = count_result.scalar()

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size if total else 0,
    )


@transactions_router.post("", response_model=TransactionResponse, status_code=201)
async def create_transaction(
    request: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create new transaction."""
    transaction = Transaction(
        user_id=current_user.id,
        account_id=request.account_id,
        category_id=request.category_id,
        subcategory_id=request.subcategory_id,
        card_id=request.card_id,
        type=request.type,
        amount=request.amount,
        description=request.description,
        date=request.date,
        due_date=request.due_date,
        payment_method=request.payment_method,
        is_recurring=request.is_recurring,
        is_installment=request.is_installment,
        total_installments=request.total_installments,
        is_scheduled=request.is_scheduled,
        scheduled_date=request.scheduled_date,
        transfer_account_id=request.transfer_account_id,
        notes=request.notes,
        location=request.location,
    )
    db.add(transaction)
    await db.flush()

    if request.tags:
        for tag_name in request.tags:
            from src.infrastructure.persistence.models.tag import Tag, TransactionTag
            tag_query = select(Tag).where(
                Tag.user_id == current_user.id,
                Tag.name == tag_name,
            )
            tag_result = await db.execute(tag_query)
            tag = tag_result.scalar_one_or_none()
            if not tag:
                tag = Tag(user_id=current_user.id, name=tag_name)
                db.add(tag)
                await db.flush()

            ttag = TransactionTag(transaction_id=transaction.id, tag_id=tag.id)
            db.add(ttag)

    await db.flush()
    return transaction


@transactions_router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get transaction by ID."""
    result = await db.execute(
        select(Transaction).where(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id,
            Transaction.is_deleted.is_(False),
        )
    )
    transaction = result.scalar_one_or_none()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


@transactions_router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: UUID,
    request: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update transaction."""
    result = await db.execute(
        select(Transaction).where(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id,
            Transaction.is_deleted.is_(False),
        )
    )
    transaction = result.scalar_one_or_none()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    for key, value in request.model_dump(exclude_none=True).items():
        setattr(transaction, key, value)

    await db.flush()
    return transaction


@transactions_router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete transaction."""
    result = await db.execute(
        select(Transaction).where(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id,
            Transaction.is_deleted.is_(False),
        )
    )
    transaction = result.scalar_one_or_none()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    transaction.soft_delete()
    await db.flush()
    return {"message": "Transaction deleted successfully"}