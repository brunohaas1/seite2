"""User API routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies.auth import get_current_user
from src.api.schemas.user import UserResponse, UserUpdateRequest, UserPreferencesResponse, UserPreferencesUpdate
from src.infrastructure.persistence.database import get_db
from src.infrastructure.persistence.models.user import User
from src.application.use_cases.user import UserUseCase

users_router = APIRouter(prefix="/api/v1/users", tags=["Users"])


@users_router.get("/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return current_user


@users_router.put("/me", response_model=UserResponse)
async def update_profile(
    request: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user profile."""
    use_case = UserUseCase(db)
    user = await use_case.update(
        str(current_user.id),
        **request.model_dump(exclude_none=True),
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@users_router.get("/me/preferences", response_model=UserPreferencesResponse)
async def get_preferences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user preferences."""
    use_case = UserUseCase(db)
    user = await use_case.get_by_id(str(current_user.id))
    if not user or not user.preferences:
        raise HTTPException(status_code=404, detail="Preferences not found")
    return user.preferences


@users_router.put("/me/preferences", response_model=UserPreferencesResponse)
async def update_preferences(
    request: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update user preferences."""
    use_case = UserUseCase(db)
    user = await use_case.get_by_id(str(current_user.id))
    if not user or not user.preferences:
        raise HTTPException(status_code=404, detail="Preferences not found")

    for key, value in request.model_dump(exclude_none=True).items():
        setattr(user.preferences, key, value)

    await db.flush()
    return user.preferences


@users_router.delete("/me")
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete current user account."""
    use_case = UserUseCase(db)
    success = await use_case.delete(str(current_user.id))
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Account deleted successfully"}