"""Categories API routes."""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies.auth import get_current_user
from src.api.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from src.infrastructure.persistence.database import get_db
from src.infrastructure.persistence.models.user import User
from src.infrastructure.persistence.models.category import Category

categories_router = APIRouter(prefix="/api/v1/categories", tags=["Categories"])


@categories_router.get("", response_model=list[CategoryResponse])
async def list_categories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Category)
        .where(Category.user_id == current_user.id, Category.is_active == True)
        .order_by(Category.order, Category.name)
    )
    return result.scalars().all()


@categories_router.post("", response_model=CategoryResponse, status_code=201)
async def create_category(
    request: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    category = Category(
        user_id=current_user.id,
        name=request.name,
        type=request.type,
        color=request.color,
        icon=request.icon,
    )
    db.add(category)
    await db.flush()
    return category


@categories_router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: UUID,
    request: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Category).where(
            Category.id == category_id,
            Category.user_id == current_user.id,
        )
    )
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    for key, value in request.model_dump(exclude_none=True).items():
        setattr(category, key, value)
    await db.flush()
    return category


@categories_router.delete("/{category_id}")
async def delete_category(
    category_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Category).where(
            Category.id == category_id,
            Category.user_id == current_user.id,
        )
    )
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    category.is_active = False
    await db.flush()
    return {"message": "Category deleted successfully"}


@categories_router.post("/defaults")
async def create_default_categories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create default categories for new user."""
    defaults = [
        ("Salário", "income", "#00B894", "wallet"),
        ("Freelance", "income", "#74B9FF", "briefcase"),
        ("Investimentos", "income", "#6C5CE7", "trending-up"),
        ("Alimentação", "expense", "#E17055", "shopping-cart"),
        ("Transporte", "expense", "#FDCB6E", "car"),
        ("Moradia", "expense", "#E17055", "home"),
        ("Saúde", "expense", "#00B894", "heart"),
        ("Educação", "expense", "#74B9FF", "book"),
        ("Lazer", "expense", "#FD79A8", "music"),
        ("Compras", "expense", "#6C5CE7", "shopping-bag"),
        ("Assinaturas", "expense", "#FDCB6E", "repeat"),
        ("Serviços", "expense", "#E17055", "zap"),
    ]

    for name, type_, color, icon in defaults:
        existing = await db.execute(
            select(Category).where(
                Category.user_id == current_user.id,
                Category.name == name,
            )
        )
        if not existing.scalar_one_or_none():
            category = Category(
                user_id=current_user.id,
                name=name,
                type=type_,
                color=color,
                icon=icon,
                is_default=True,
            )
            db.add(category)

    await db.flush()
    return {"message": "Default categories created successfully"}