"""Investment and InvestmentTransaction models."""

from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, UUIDMixin
import uuid


class Investment(UUIDMixin, TimestampMixin, Base):
    """Investment asset model."""

    __tablename__ = "investments"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    ticker: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(
        Numeric(15, 4), default=0, nullable=False
    )
    average_price: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), default=0, nullable=False
    )
    current_price: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), default=0, nullable=False
    )
    total_invested: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), default=0, nullable=False
    )
    total_dividends: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), default=0, nullable=False
    )
    currency: Mapped[str] = mapped_column(String(3), default="BRL", nullable=False)
    broker: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    user = relationship("User")
    transactions = relationship(
        "InvestmentTransaction", back_populates="investment",
        cascade="all, delete-orphan",
    )


class InvestmentTransaction(UUIDMixin, TimestampMixin, Base):
    """Investment transaction (buy/sell/dividend)."""

    __tablename__ = "investment_transactions"

    investment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("investments.id", ondelete="CASCADE"), nullable=False
    )
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(15, 4), nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    total: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    date: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    broker: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    investment = relationship("Investment", back_populates="transactions")


if TYPE_CHECKING:
    pass