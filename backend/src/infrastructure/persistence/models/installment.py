"""Installment model for split transactions."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, UUIDMixin


class Installment(UUIDMixin, TimestampMixin, Base):
    """Transaction installment model."""

    __tablename__ = "installments"

    transaction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("transactions.id", ondelete="CASCADE"),
        nullable=False,
    )
    installment_number: Mapped[int] = mapped_column(
        String(10), nullable=False
    )
    total_installments: Mapped[int] = mapped_column(
        String(10), nullable=False
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    due_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    payment_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(20), default="pending", nullable=False
    )
    is_paid: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    transaction: Mapped["Transaction"] = relationship(back_populates="installments")


if TYPE_CHECKING:
    from .transaction import Transaction