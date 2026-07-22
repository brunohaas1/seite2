"""Authentication use case."""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.security import (
    create_access_token,
    create_refresh_token,
    verify_token,
    password_handler,
)
from src.infrastructure.persistence.models.user import (
    User,
    UserSession,
    OAuthAccount,
)


class AuthUseCase:
    """Authentication business logic."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(
        self,
        email: str,
        password: str,
        name: str,
    ) -> dict:
        """Register new user and return tokens."""
        from .user import UserUseCase

        user_use_case = UserUseCase(self.db)
        existing = await user_use_case.get_by_email(email)
        if existing:
            raise ValueError("Email already registered")

        user = await user_use_case.create(
            email=email,
            password=password,
            name=name,
        )

        tokens = await self._create_tokens(user)
        return {"user": user, **tokens}

    async def login(
        self,
        email: str,
        password: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> dict:
        """Authenticate user and return tokens."""
        from .user import UserUseCase

        user_use_case = UserUseCase(self.db)
        user = await user_use_case.authenticate(email, password)

        if not user:
            raise ValueError("Invalid credentials")

        user.last_login_at = datetime.now(timezone.utc)
        user.last_login_ip = ip_address
        await self.db.flush()

        tokens = await self._create_tokens(
            user, ip_address=ip_address, user_agent=user_agent
        )
        return {"user": user, **tokens}

    async def refresh_token(self, refresh_token: str) -> dict:
        """Refresh access token."""
        payload = verify_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise ValueError("Invalid refresh token")

        token_id = payload.get("jti")
        result = await self.db.execute(
            select(UserSession).where(
                UserSession.refresh_token_id == token_id,
                UserSession.is_active == True,
            )
        )
        session = result.scalar_one_or_none()

        if not session:
            raise ValueError("Session not found or expired")

        session.is_active = False
        await self.db.flush()

        user = await self.db.get(User, session.user_id)
        if not user:
            raise ValueError("User not found")

        return await self._create_tokens(user)

    async def logout(self, refresh_token: str) -> bool:
        """Invalidate refresh token."""
        payload = verify_token(refresh_token)
        if not payload:
            return False

        token_id = payload.get("jti")
        result = await self.db.execute(
            select(UserSession).where(
                UserSession.refresh_token_id == token_id,
                UserSession.is_active == True,
            )
        )
        session = result.scalar_one_or_none()

        if session:
            session.is_active = False
            await self.db.flush()

        return True

    async def oauth_login(
        self,
        provider: str,
        provider_user_id: str,
        provider_email: str,
        name: str,
        access_token: str,
        refresh_token: Optional[str] = None,
    ) -> dict:
        """Login/register with OAuth provider."""
        result = await self.db.execute(
            select(OAuthAccount).where(
                OAuthAccount.provider == provider,
                OAuthAccount.provider_user_id == provider_user_id,
            )
        )
        oauth_account = result.scalar_one_or_none()

        if oauth_account:
            user = await self.db.get(User, oauth_account.user_id)
            if not user:
                raise ValueError("User not found")

            oauth_account.access_token = access_token
            if refresh_token:
                oauth_account.refresh_token = refresh_token
            await self.db.flush()

            return await self._create_tokens(user)

        from .user import UserUseCase

        user_use_case = UserUseCase(self.db)
        existing_user = await user_use_case.get_by_email(provider_email)

        if existing_user:
            user = existing_user
        else:
            user = await user_use_case.create(
                email=provider_email,
                password=uuid.uuid4().hex,
                name=name,
                is_verified=True,
            )

        oauth_account = OAuthAccount(
            user_id=user.id,
            provider=provider,
            provider_user_id=provider_user_id,
            provider_email=provider_email,
            access_token=access_token,
            refresh_token=refresh_token,
        )
        self.db.add(oauth_account)
        await self.db.flush()

        return await self._create_tokens(user)

    async def _create_tokens(
        self,
        user: User,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> dict:
        """Create access and refresh tokens."""
        token_id = str(uuid.uuid4())

        access_token = create_access_token(
            subject=str(user.id),
            extra_claims={
                "email": user.email,
                "name": user.name,
            },
        )
        refresh_token = create_refresh_token(
            subject=str(user.id),
            token_id=token_id,
        )

        session = UserSession(
            user_id=user.id,
            refresh_token=refresh_token,
            refresh_token_id=token_id,
            ip_address=ip_address,
            user_agent=user_agent,
            expires_at=datetime.now(timezone.utc),
        )
        self.db.add(session)
        await self.db.flush()

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }