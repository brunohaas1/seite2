"""Authentication API routes."""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies.auth import get_current_user
from src.api.schemas.auth import (
    RegisterRequest, RegisterResponse, LoginRequest, LoginResponse,
    RefreshTokenRequest, RefreshTokenResponse, UserData,
)
from src.infrastructure.persistence.database import get_db
from src.infrastructure.persistence.models.user import User
from src.application.use_cases.auth import AuthUseCase

auth_router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@auth_router.post("/register", response_model=RegisterResponse)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register new user."""
    auth = AuthUseCase(db)
    try:
        result = await auth.register(
            email=request.email,
            password=request.password,
            name=request.name,
        )
        return RegisterResponse(
            user=UserData(
                id=result["user"].id,
                email=result["user"].email,
                name=result["user"].name,
                photo_url=result["user"].photo_url,
                is_verified=result["user"].is_verified,
                is_active=result["user"].is_active,
            ),
            access_token=result["access_token"],
            refresh_token=result["refresh_token"],
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@auth_router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    req: Request,
    db: AsyncSession = Depends(get_db),
):
    """Login user."""
    auth = AuthUseCase(db)
    try:
        result = await auth.login(
            email=request.email,
            password=request.password,
            ip_address=req.client.host if req.client else None,
            user_agent=req.headers.get("user-agent"),
        )
        return LoginResponse(
            user=UserData(
                id=result["user"].id,
                email=result["user"].email,
                name=result["user"].name,
                photo_url=result["user"].photo_url,
                is_verified=result["user"].is_verified,
                is_active=result["user"].is_active,
            ),
            access_token=result["access_token"],
            refresh_token=result["refresh_token"],
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@auth_router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh(request: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Refresh access token."""
    auth = AuthUseCase(db)
    try:
        result = await auth.refresh_token(request.refresh_token)
        return RefreshTokenResponse(
            access_token=result["access_token"],
            refresh_token=result["refresh_token"],
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@auth_router.post("/logout")
async def logout(
    request: RefreshTokenRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Logout user."""
    auth = AuthUseCase(db)
    await auth.logout(request.refresh_token)
    return {"message": "Logged out successfully"}


@auth_router.get("/me", response_model=UserData)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user."""
    return UserData(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        photo_url=current_user.photo_url,
        is_verified=current_user.is_verified,
        is_active=current_user.is_active,
    )