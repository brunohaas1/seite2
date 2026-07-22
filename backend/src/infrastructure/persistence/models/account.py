"""Account model for bank accounts, wallets, etc."""

import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, UUIDMixin, SoftDeleteMixin


class Account(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    """Financial account model."""

    __tablename__ = "accounts"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )
    bank_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    bank_code: Mapped[str | None] = mapped_column(String(10), nullable=True)
    agency: Mapped[str | None] = mapped_column(String(20), nullable=True)
    account_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    digit: Mapped[str | None] = mapped_column(String(5), nullable=True)
    balance: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), default=Decimal("0.00"), nullable=False
    )
    initial_balance: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), default=Decimal("0.00"), nullable=False
    )
    currency: Mapped[str] = mapped_column(String(3), default="BRL", nullable=False)
    color: Mapped[str | None] = mapped_column(String(7), nullable=True)
    icon: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_include_in_total: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )
    is_credit_card: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    credit_limit: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2), nullable=True
    )
    closing_day: Mapped[int | None] = mapped_column(
        String(10), nullable=True
    )
    due_day: Mapped[int | None] = mapped_column(
        String(10), nullable=True
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="accounts")
    transactions: Mapped[list["Transaction"]] = relationship(
        back_populates="account", cascade="all, delete-orphan"
    )
    cards: Mapped[list["Card"]] = relationship(
        back_populates="account", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Account {self.name}>"


if TYPE_CHECKING:
    from .user import User
    from .transaction import Transaction
    from .card import Card