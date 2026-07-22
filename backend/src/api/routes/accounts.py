"""Accounts API routes."""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies.auth import get_current_user
from src.api.schemas.account import AccountCreate, AccountResponse, AccountUpdate
from src.infrastructure.persistence.database import get_db
from src.infrastructure.persistence.models.user import User
from src.application.use_cases.account import AccountUseCase

accounts_router = APIRouter(prefix="/api/v1/accounts", tags=["Accounts"])


@accounts_router.get("", response_model=list[AccountResponse])
async def list_accounts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    uc = AccountUseCase(db)
    return await uc.list_by_user(current_user.id)


@accounts_router.post("", response_model=AccountResponse, status_code=201)
async def create_account(
    request: AccountCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    uc = AccountUseCase(db)
    return await uc.create(
        user_id=current_user.id,
        name=request.name,
        type=request.type,
        **request.model_dump(exclude={"name", "type"}, exclude_none=True),
    )


@accounts_router.get("/summary")
async def account_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    uc = AccountUseCase(db)
    return await uc.get_summary(current_user.id)


@accounts_router.get("/{account_id}", response_model=AccountResponse)
async def get_account(
    account_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    uc = AccountUseCase(db)
    account = await uc.get_by_id(account_id, current_user.id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@accounts_router.put("/{account_id}", response_model=AccountResponse)
async def update_account(
    account_id: UUID,
    request: AccountUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    uc = AccountUseCase(db)
    account = await uc.update(
        account_id, current_user.id,
        **request.model_dump(exclude_none=True),
    )
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@accounts_router.delete("/{account_id}")
async def delete_account(
    account_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    uc = AccountUseCase(db)
    success = await uc.delete(account_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Account not found")
    return {"message": "Account deleted successfully"}