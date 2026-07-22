"""Admin API routes."""

from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies.auth import get_current_superuser
from src.infrastructure.persistence.database import get_db
from src.infrastructure.persistence.models.user import User
from src.infrastructure.persistence.models.transaction import Transaction
from src.infrastructure.persistence.models.ocr import OCRDocument
from src.infrastructure.persistence.models.ai import AIConversation
from src.application.use_cases.user import UserUseCase

admin_router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])


@admin_router.get("/stats")
async def admin_stats(
    current_user: User = Depends(get_current_superuser),
    db: AsyncSession = Depends(get_db),
):
    """Get system statistics."""
    total_users = await db.execute(select(func.count(User.id)))
    active_users = await db.execute(
        select(func.count(User.id)).where(User.is_active == True)
    )
    total_transactions = await db.execute(select(func.count(Transaction.id)))
    total_ocr = await db.execute(select(func.count(OCRDocument.id)))
    total_ai = await db.execute(select(func.count(AIConversation.id)))

    today = datetime.now(timezone.utc)
    today_users = await db.execute(
        select(func.count(User.id)).where(User.created_at >= today - timedelta(days=1))
    )

    return {
        "total_users": total_users.scalar() or 0,
        "active_users": active_users.scalar() or 0,
        "new_users_today": today_users.scalar() or 0,
        "total_transactions": total_transactions.scalar() or 0,
        "total_ocr_documents": total_ocr.scalar() or 0,
        "total_ai_conversations": total_ai.scalar() or 0,
    }


@admin_router.get("/users")
async def admin_list_users(
    page: int = 1,
    page_size: int = 20,
    current_user: User = Depends(get_current_superuser),
    db: AsyncSession = Depends(get_db),
):
    """List all users (admin)."""
    uc = UserUseCase(db)
    users = await uc.list_users(skip=(page - 1) * page_size, limit=page_size)
    total = await uc.count_users()

    return {
        "items": [
            {
                "id": str(u.id),
                "email": u.email,
                "name": u.name,
                "is_active": u.is_active,
                "is_verified": u.is_verified,
                "is_superuser": u.is_superuser,
                "created_at": u.created_at.isoformat(),
                "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
            }
            for u in users
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@admin_router.get("/audit-log")
async def admin_audit_log(
    current_user: User = Depends(get_current_superuser),
    db: AsyncSession = Depends(get_db),
):
    """Get recent audit log entries."""
    from src.infrastructure.persistence.models.log import AuditLog
    result = await db.execute(
        select(AuditLog).order_by(AuditLog.created_at.desc()).limit(50)
    )
    return [
        {
            "id": str(log.id),
            "user_id": str(log.user_id) if log.user_id else None,
            "action": log.action,
            "resource": log.resource,
            "details": log.details,
            "ip_address": log.ip_address,
            "created_at": log.created_at.isoformat(),
        }
        for log in result.scalars().all()
    ]