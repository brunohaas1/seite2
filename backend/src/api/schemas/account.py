"""Account Pydantic schemas."""

from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class AccountCreate(BaseModel):
    """Account create request schema."""

    name: str = Field(min_length=1, max_length=255)
    type: str = Field(pattern="^(checking|savings|wallet|investment|credit_card|other)$")
    bank_name: Optional[str] = None
    bank_code: Optional[str] = None
    agency: Optional[str] = None
    account_number: Optional[str] = None
    digit: Optional[str] = None
    initial_balance: Decimal = Field(default=0, ge=0)
    currency: str = "BRL"
    color: Optional[str] = None
    icon: Optional[str] = None
    is_include_in_total: bool = True
    credit_limit: Optional[Decimal] = None
    closing_day: Optional[int] = None
    due_day: Optional[int] = None
    notes: Optional[str] = None


class AccountUpdate(BaseModel):
    """Account update request schema."""

    name: Optional[str] = None
    type: Optional[str] = None
    bank_name: Optional[str] = None
    bank_code: Optional[str] = None
    agency: Optional[str] = None
    account_number: Optional[str] = None
    digit: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    is_include_in_total: Optional[bool] = None
    credit_limit: Optional[Decimal] = None
    closing_day: Optional[int] = None
    due_day: Optional[int] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class AccountResponse(BaseModel):
    """Account response schema."""

    id: UUID
    name: str
    type: str
    bank_name: Optional[str] = None
    agency: Optional[str] = None
    account_number: Optional[str] = None
    balance: Decimal
    initial_balance: Decimal
    currency: str
    color: Optional[str] = None
    icon: Optional[str] = None
    is_include_in_total: bool
    is_credit_card: bool
    credit_limit: Optional[Decimal] = None
    closing_day: Optional[int] = None
    due_day: Optional[int] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}