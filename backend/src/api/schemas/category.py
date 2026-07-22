"""Category Pydantic schemas."""

from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    """Category create request schema."""

    name: str = Field(min_length=1, max_length=255)
    type: str = Field(pattern="^(income|expense)$")
    color: Optional[str] = None
    icon: Optional[str] = None
    parent_id: Optional[UUID] = None


class CategoryUpdate(BaseModel):
    """Category update request schema."""

    name: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    is_active: Optional[bool] = None


class CategoryResponse(BaseModel):
    """Category response schema."""

    id: UUID
    name: str
    type: str
    color: Optional[str] = None
    icon: Optional[str] = None
    is_active: bool
    is_default: bool
    order: int
    subcategories: list["SubcategoryResponse"] = []

    model_config = {"from_attributes": True}


class SubcategoryResponse(BaseModel):
    """Subcategory response schema."""

    id: UUID
    name: str
    color: Optional[str] = None
    icon: Optional[str] = None
    is_active: bool

    model_config = {"from_attributes": True}