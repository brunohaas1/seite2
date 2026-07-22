"""User use case for business logic."""

import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.persistence.models.user import User, UserPreferences, UserSession
from src.core.security import password_handler


class UserUseCase:
    """User business logic."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID."""
        result = await self.db.execute(
            select(User).where(User.id == uuid.UUID(user_id), User.is_deleted.is_(False))
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        result = await self.db.execute(
            select(User).where(User.email == email, User.is_deleted.is_(False))
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        email: str,
        password: str,
        name: str,
        **kwargs,
    ) -> User:
        """Create new user."""
        user = User(
            email=email,
            password_hash=password_handler.hash_password(password),
            name=name,
            **kwargs,
        )
        self.db.add(user)
        await self.db.flush()

        # Create default preferences
        preferences = UserPreferences(user_id=user.id)
        self.db.add(preferences)
        await self.db.flush()

        return user

    async def update(self, user_id: str, **kwargs) -> Optional[User]:
        """Update user."""
        user = await self.get_by_id(user_id)
        if not user:
            return None

        for key, value in kwargs.items():
            if hasattr(user, key) and value is not None:
                setattr(user, key, value)

        await self.db.flush()
        return user

    async def delete(self, user_id: str) -> bool:
        """Soft delete user."""
        user = await self.get_by_id(user_id)
        if not user:
            return False

        user.soft_delete()
        await self.db.flush()
        return True

    async def authenticate(self, email: str, password: str) -> Optional[User]:
        """Authenticate user."""
        user = await self.get_by_email(email)
        if not user or not user.password_hash:
            return None

        if not password_handler.verify_password(password, user.password_hash):
            return None

        return user

    async def list_users(
        self,
        skip: int = 0,
        limit: int = 100,
        is_active: Optional[bool] = None,
    ) -> list[User]:
        """List users with pagination."""
        query = select(User).where(User.is_deleted.is_(False))

        if is_active is not None:
            query = query.where(User.is_active == is_active)

        query = query.offset(skip).limit(limit).order_by(User.created_at.desc())
        result = await self.db.execute(query)
        return result.scalars().all()

    async def count_users(self, is_active: Optional[bool] = None) -> int:
        """Count users."""
        query = select(User).where(User.is_deleted.is_(False))

        if is_active is not None:
            query = query.where(User.is_active == is_active)

        result = await self.db.execute(query)
        return len(result.scalars().all())