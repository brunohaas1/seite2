"""Transaction model for financial records."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, UUIDMixin, SoftDeleteMixin


class Transaction(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    """Financial transaction model."""

    __tablename__ = "transactions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    account_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"),
        nullable=False,
    )
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
    )
    subcategory_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("subcategories.id", ondelete="SET NULL"),
        nullable=True,
    )
    card_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cards.id", ondelete="SET NULL"),
        nullable=True,
    )
    type: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), nullable=False
    )
    original_amount: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2), nullable=True
    )
    original_currency: Mapped[str | None] = mapped_column(
        String(3), nullable=True
    )
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    long_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    due_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    payment_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(20), default="pending", nullable=False
    )
    payment_method: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_recurring: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    is_installment: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    installment_number: Mapped[int | None] = mapped_column(
        String(10), nullable=True
    )
    total_installments: Mapped[int | None] = mapped_column(
        String(10), nullable=True
    )
    recurrence_type: Mapped[str | None] = mapped_column(
        String(20), nullable=True
    )
    recurrence_interval: Mapped[int | None] = mapped_column(
        String(10), nullable=True
    )
    recurrence_end_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    is_scheduled: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    scheduled_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    is_transfer: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    transfer_account_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="SET NULL"),
        nullable=True,
    )
    is_confirmed: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )
    document_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    latitude: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 7), nullable=True
    )
    longitude: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 7), nullable=True
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship()
    account: Mapped["Account"] = relationship(
        foreign_keys="[Transaction.account_id]",
        back_populates="transactions",
    )
    category: Mapped["Category | None"] = relationship(back_populates="transactions")
    subcategory: Mapped["Subcategory | None"] = relationship(
        back_populates="transactions"
    )
    card: Mapped["Card | None"] = relationship(back_populates="transactions")
    transfer_account: Mapped["Account | None"] = relationship(
        foreign_keys=[transfer_account_id]
    )
    installments: Mapped[list["Installment"]] = relationship(
        back_populates="transaction", cascade="all, delete-orphan"
    )
    attachments: Mapped[list["Attachment"]] = relationship(
        back_populates="transaction", cascade="all, delete-orphan"
    )
    tags: Mapped[list["TransactionTag"]] = relationship(
        back_populates="transaction", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Transaction {self.description}: {self.amount}>"


if TYPE_CHECKING:
    from .user import User
    from .account import Account
    from .category import Category, Subcategory
    from .card import Card
    from .installment import Installment
    from .attachment import Attachment
    from .tag import TransactionTag