"""Card model for credit/debit cards."""

import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, UUIDMixin, SoftDeleteMixin


class Card(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    """Credit/Debit card model."""

    __tablename__ = "cards"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    account_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    brand: Mapped[str | None] = mapped_column(String(50), nullable=True)
    last_digits: Mapped[str | None] = mapped_column(String(4), nullable=True)
    card_type: Mapped[str] = mapped_column(String(20), default="credit")
    flag: Mapped[str | None] = mapped_column(String(50), nullable=True)
    limit_total: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), default=Decimal("0.00"), nullable=False
    )
    limit_available: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), default=Decimal("0.00"), nullable=False
    )
    closing_day: Mapped[int] = mapped_column(
        String(10), default="1", nullable=False
    )
    due_day: Mapped[int] = mapped_column(
        String(10), default="15", nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    color: Mapped[str | None] = mapped_column(String(7), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship()
    account: Mapped["Account"] = relationship(back_populates="cards")
    transactions: Mapped[list["Transaction"]] = relationship(
        back_populates="card", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Card {self.name}>"


if TYPE_CHECKING:
    from .user import User
    from .account import Account
    from .transaction import Transaction