"""Dashboard API routes for real-time financial overview."""

from datetime import datetime, timezone, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, extract
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies.auth import get_current_user
from src.infrastructure.persistence.database import get_db
from src.infrastructure.persistence.models.user import User
from src.infrastructure.persistence.models.transaction import Transaction
from src.infrastructure.persistence.models.account import Account
from src.application.use_cases.account import AccountUseCase

dashboard_router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])


@dashboard_router.get("/overview")
async def dashboard_overview(
    period: str = Query("month", pattern="^(week|month|year)$"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get dashboard overview data."""
    today = datetime.now(timezone.utc)
    if period == "week":
        start_date = today - timedelta(days=7)
    elif period == "month":
        start_date = today - timedelta(days=30)
    else:
        start_date = today - timedelta(days=365)

    # Account summary
    account_uc = AccountUseCase(db)
    summary = await account_uc.get_summary(current_user.id)

    # Period income/expense
    income_result = await db.execute(
        select(func.sum(Transaction.amount)).where(
            Transaction.user_id == current_user.id,
            Transaction.type == "income",
            Transaction.date >= start_date,
            Transaction.is_deleted.is_(False),
            Transaction.is_confirmed == True,
        )
    )
    expense_result = await db.execute(
        select(func.sum(Transaction.amount)).where(
            Transaction.user_id == current_user.id,
            Transaction.type == "expense",
            Transaction.date >= start_date,
            Transaction.is_deleted.is_(False),
            Transaction.is_confirmed == True,
        )
    )
    period_income = income_result.scalar() or Decimal("0.00")
    period_expense = expense_result.scalar() or Decimal("0.00")

    # Recent transactions
    recent = await db.execute(
        select(Transaction)
        .where(
            Transaction.user_id == current_user.id,
            Transaction.is_deleted.is_(False),
        )
        .order_by(Transaction.date.desc())
        .limit(10)
    )
    recent_txns = recent.scalars().all()

    # Monthly breakdown for chart
    current_year = today.year
    monthly_data = []
    for month in range(1, 13):
        inc = await db.execute(
            select(func.coalesce(func.sum(Transaction.amount), 0)).where(
                Transaction.user_id == current_user.id,
                Transaction.type == "income",
                extract("year", Transaction.date) == current_year,
                extract("month", Transaction.date) == month,
                Transaction.is_deleted.is_(False),
            )
        )
        exp = await db.execute(
            select(func.coalesce(func.sum(Transaction.amount), 0)).where(
                Transaction.user_id == current_user.id,
                Transaction.type == "expense",
                extract("year", Transaction.date) == current_year,
                extract("month", Transaction.date) == month,
                Transaction.is_deleted.is_(False),
            )
        )
        monthly_data.append({
            "month": month,
            "income": float(inc.scalar() or 0),
            "expense": float(exp.scalar() or 0),
        })

    # Category breakdown
    cat_income = await db.execute(
        select(
            Transaction.category_id,
            func.sum(Transaction.amount).label("total"),
        )
        .where(
            Transaction.user_id == current_user.id,
            Transaction.type == "income",
            Transaction.date >= start_date,
            Transaction.is_deleted.is_(False),
        )
        .group_by(Transaction.category_id)
        .limit(10)
    )
    cat_expense = await db.execute(
        select(
            Transaction.category_id,
            func.sum(Transaction.amount).label("total"),
        )
        .where(
            Transaction.user_id == current_user.id,
            Transaction.type == "expense",
            Transaction.date >= start_date,
            Transaction.is_deleted.is_(False),
        )
        .group_by(Transaction.category_id)
        .limit(10)
    )

    return {
        "balance": float(summary["total_balance"]),
        "period_income": float(period_income),
        "period_expense": float(period_expense),
        "period_net": float(period_income - period_expense),
        "account_count": summary["account_count"],
        "recent_transactions": [
            {
                "id": str(t.id),
                "description": t.description,
                "amount": float(t.amount),
                "type": t.type,
                "date": t.date.isoformat(),
                "category_id": str(t.category_id) if t.category_id else None,
            }
            for t in recent_txns
        ],
        "monthly_data": monthly_data,
        "category_income": [
            {"category_id": str(c[0]) if c[0] else None, "total": float(c[1])}
            for c in cat_income
        ],
        "category_expense": [
            {"category_id": str(c[0]) if c[0] else None, "total": float(c[1])}
            for c in cat_expense
        ],
    }


@dashboard_router.get("/cash-flow")
async def cash_flow(
    months: int = Query(6, ge=1, le=24),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get cash flow data for charting."""
    today = datetime.now(timezone.utc)
    data = []
    for i in range(months - 1, -1, -1):
        month_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0) - timedelta(days=30 * i)
        if month_start.month == 12:
            month_end = month_start.replace(month=1, day=1) - timedelta(days=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1, day=1) - timedelta(days=1)

        inc = await db.execute(
            select(func.coalesce(func.sum(Transaction.amount), 0)).where(
                Transaction.user_id == current_user.id,
                Transaction.type == "income",
                Transaction.date >= month_start,
                Transaction.date <= month_end,
                Transaction.is_deleted.is_(False),
                Transaction.is_confirmed == True,
            )
        )
        exp = await db.execute(
            select(func.coalesce(func.sum(Transaction.amount), 0)).where(
                Transaction.user_id == current_user.id,
                Transaction.type == "expense",
                Transaction.date >= month_start,
                Transaction.date <= month_end,
                Transaction.is_deleted.is_(False),
                Transaction.is_confirmed == True,
            )
        )
        data.append({
            "month": month_start.strftime("%Y-%m"),
            "income": float(inc.scalar() or 0),
            "expense": float(exp.scalar() or 0),
        })
    return {"cash_flow": data}