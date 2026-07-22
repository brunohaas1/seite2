"""Account use case for business logic."""

from decimal import Decimal
from typing import Optional
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.persistence.models.account import Account
from src.infrastructure.persistence.models.transaction import Transaction


class AccountUseCase:
    """Account business logic."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, account_id: UUID, user_id: UUID) -> Optional[Account]:
        result = await self.db.execute(
            select(Account).where(
                Account.id == account_id,
                Account.user_id == user_id,
                Account.is_deleted.is_(False),
            )
        )
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: UUID) -> list[Account]:
        result = await self.db.execute(
            select(Account)
            .where(Account.user_id == user_id, Account.is_deleted.is_(False))
            .order_by(Account.name)
        )
        return result.scalars().all()

    async def create(
        self, user_id: UUID, name: str, type: str, **kwargs
    ) -> Account:
        account = Account(user_id=user_id, name=name, type=type, **kwargs)
        self.db.add(account)
        await self.db.flush()
        return account

    async def update(self, account_id: UUID, user_id: UUID, **kwargs) -> Optional[Account]:
        account = await self.get_by_id(account_id, user_id)
        if not account:
            return None
        for key, value in kwargs.items():
            if hasattr(account, key) and value is not None:
                setattr(account, key, value)
        await self.db.flush()
        return account

    async def delete(self, account_id: UUID, user_id: UUID) -> bool:
        account = await self.get_by_id(account_id, user_id)
        if not account:
            return False
        account.soft_delete()
        await self.db.flush()
        return True

    async def get_balance(self, account_id: UUID, user_id: UUID) -> Decimal:
        account = await self.get_by_id(account_id, user_id)
        if not account:
            return Decimal("0.00")

        income = await self.db.execute(
            select(func.sum(Transaction.amount)).where(
                Transaction.account_id == account_id,
                Transaction.type == "income",
                Transaction.is_deleted.is_(False),
                Transaction.is_confirmed == True,
            )
        )
        expense = await self.db.execute(
            select(func.sum(Transaction.amount)).where(
                Transaction.account_id == account_id,
                Transaction.type == "expense",
                Transaction.is_deleted.is_(False),
                Transaction.is_confirmed == True,
            )
        )
        total_income = income.scalar() or Decimal("0.00")
        total_expense = expense.scalar() or Decimal("0.00")
        return account.initial_balance + total_income - total_expense

    async def get_total_balance(self, user_id: UUID) -> Decimal:
        accounts = await self.list_by_user(user_id)
        total = Decimal("0.00")
        for account in accounts:
            if account.is_include_in_total:
                balance = await self.get_balance(account.id, user_id)
                total += balance
        return total

    async def get_summary(self, user_id: UUID) -> dict:
        accounts = await self.list_by_user(user_id)
        total_balance = Decimal("0.00")
        total_income = Decimal("0.00")
        total_expense = Decimal("0.00")

        for account in accounts:
            balance = await self.get_balance(account.id, user_id)
            if account.is_include_in_total:
                total_balance += balance

            inc = await self.db.execute(
                select(func.sum(Transaction.amount)).where(
                    Transaction.account_id == account.id,
                    Transaction.type == "income",
                    Transaction.is_deleted.is_(False),
                    Transaction.is_confirmed == True,
                )
            )
            exp = await self.db.execute(
                select(func.sum(Transaction.amount)).where(
                    Transaction.account_id == account.id,
                    Transaction.type == "expense",
                    Transaction.is_deleted.is_(False),
                    Transaction.is_confirmed == True,
                )
            )
            total_income += inc.scalar() or Decimal("0.00")
            total_expense += exp.scalar() or Decimal("0.00")

        return {
            "total_balance": total_balance,
            "total_income": total_income,
            "total_expense": total_expense,
            "net_income": total_income - total_expense,
            "account_count": len(accounts),
        }