"""Transaction Pydantic schemas."""

from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class TransactionCreate(BaseModel):
    """Transaction create request schema."""

    account_id: UUID
    category_id: Optional[UUID] = None
    subcategory_id: Optional[UUID] = None
    card_id: Optional[UUID] = None
    type: str = Field(pattern="^(income|expense|transfer)$")
    amount: Decimal = Field(gt=0)
    description: str = Field(min_length=1, max_length=500)
    date: datetime
    due_date: Optional[datetime] = None
    payment_method: Optional[str] = None
    is_recurring: bool = False
    is_installment: bool = False
    total_installments: Optional[int] = None
    recurrence_type: Optional[str] = None
    is_scheduled: bool = False
    scheduled_date: Optional[datetime] = None
    transfer_account_id: Optional[UUID] = None
    notes: Optional[str] = None
    tags: Optional[list[str]] = None
    location: Optional[str] = None


class TransactionUpdate(BaseModel):
    """Transaction update request schema."""

    account_id: Optional[UUID] = None
    category_id: Optional[UUID] = None
    subcategory_id: Optional[UUID] = None
    card_id: Optional[UUID] = None
    amount: Optional[Decimal] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    payment_date: Optional[datetime] = None
    status: Optional[str] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None
    is_confirmed: Optional[bool] = None


class TransactionResponse(BaseModel):
    """Transaction response schema."""

    id: UUID
    account_id: UUID
    category_id: Optional[UUID] = None
    subcategory_id: Optional[UUID] = None
    card_id: Optional[UUID] = None
    type: str
    amount: Decimal
    description: str
    date: datetime
    due_date: Optional[datetime] = None
    payment_date: Optional[datetime] = None
    status: str
    payment_method: Optional[str] = None
    is_recurring: bool
    is_installment: bool
    is_scheduled: bool
    is_transfer: bool
    is_confirmed: bool
    notes: Optional[str] = None
    location: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    category_name: Optional[str] = None
    account_name: Optional[str] = None

    model_config = {"from_attributes": True}


class TransactionFilter(BaseModel):
    """Transaction filter parameters."""

    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    account_id: Optional[UUID] = None
    category_id: Optional[UUID] = None
    card_id: Optional[UUID] = None
    type: Optional[str] = None
    status: Optional[str] = None
    payment_method: Optional[str] = None
    is_recurring: Optional[bool] = None
    is_installment: Optional[bool] = None
    is_scheduled: Optional[bool] = None
    min_amount: Optional[Decimal] = None
    max_amount: Optional[Decimal] = None
    search: Optional[str] = None
    tags: Optional[list[str]] = None