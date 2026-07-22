"""User Pydantic schemas."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserResponse(BaseModel):
    """User response schema."""

    id: UUID
    email: str
    name: str
    photo_url: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool
    is_verified: bool
    is_superuser: bool
    two_factor_enabled: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserUpdateRequest(BaseModel):
    """User update request schema."""

    name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = None
    photo_url: Optional[str] = None


class UserPreferencesResponse(BaseModel):
    """User preferences response schema."""

    theme: str = "light"
    language: str = "pt-BR"
    currency: str = "BRL"
    timezone: str = "America/Sao_Paulo"
    first_day_of_month: int = 1
    week_start: str = "monday"
    date_format: str = "DD/MM/YYYY"
    notifications_enabled: bool = True
    email_notifications: bool = True
    push_notifications: bool = True
    auto_categorize: bool = True
    ai_assistant_enabled: bool = True

    model_config = {"from_attributes": True}


class UserPreferencesUpdate(BaseModel):
    """User preferences update request schema."""

    theme: Optional[str] = None
    language: Optional[str] = None
    currency: Optional[str] = None
    timezone: Optional[str] = None
    first_day_of_month: Optional[int] = None
    week_start: Optional[str] = None
    date_format: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    auto_categorize: Optional[bool] = None
    ai_assistant_enabled: Optional[bool] = None