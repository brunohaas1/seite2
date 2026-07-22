"""Authentication Pydantic schemas."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    """Register request schema."""

    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str = Field(min_length=2, max_length=255)


class LoginRequest(BaseModel):
    """Login request schema."""

    email: EmailStr
    password: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    """Refresh token request schema."""

    refresh_token: str


class OAuthLoginRequest(BaseModel):
    """OAuth login request schema."""

    provider: str
    code: str
    redirect_uri: str


class TokenResponse(BaseModel):
    """Token response schema."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserData(BaseModel):
    """User data in responses."""

    id: UUID
    email: str
    name: str
    photo_url: Optional[str] = None
    is_verified: bool
    is_active: bool


class RegisterResponse(BaseModel):
    """Register response schema."""

    user: UserData
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class LoginResponse(BaseModel):
    """Login response schema."""

    user: UserData
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenResponse(BaseModel):
    """Refresh token response schema."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class ForgotPasswordRequest(BaseModel):
    """Forgot password request schema."""

    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Reset password request schema."""

    token: str
    password: str = Field(min_length=8, max_length=128)


class VerifyEmailRequest(BaseModel):
    """Verify email request schema."""

    token: str


class TwoFactorRequest(BaseModel):
    """2FA verification request schema."""

    code: str = Field(min_length=6, max_length=6)


class TwoFactorSetupResponse(BaseModel):
    """2FA setup response schema."""

    secret: str
    qr_code: str