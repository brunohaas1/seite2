"""Common Pydantic schemas."""

from datetime import datetime
from typing import Any, Generic, Optional, TypeVar
from uuid import UUID

from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response model."""

    items: list[T]
    total: int
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    total_pages: int = 0


class ErrorResponse(BaseModel):
    """Error response model."""

    detail: str
    code: Optional[str] = None
    errors: Optional[dict[str, list[str]]] = None


class SuccessMessage(BaseModel):
    """Success message model."""

    message: str
    data: Optional[Any] = None


class DateRange(BaseModel):
    """Date range filter."""

    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class PaginationParams(BaseModel):
    """Pagination parameters."""

    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    sort_by: Optional[str] = None
    sort_order: str = Field(default="desc", pattern="^(asc|desc)$")