"""Tag and TransactionTag models."""

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, UUIDMixin


class Tag(UUIDMixin, TimestampMixin, Base):
    """Tag model."""

    __tablename__ = "tags"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    color: Mapped[str | None] = mapped_column(String(7), nullable=True)

    user = relationship("User")
    transactions: Mapped[list["TransactionTag"]] = relationship(
        back_populates="tag", cascade="all, delete-orphan"
    )


class TransactionTag(UUIDMixin, TimestampMixin, Base):
    """Transaction-Tag association model."""

    __tablename__ = "transaction_tags"

    transaction_id: Mapped[str] = mapped_column(
        ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False
    )
    tag_id: Mapped[str] = mapped_column(
        ForeignKey("tags.id", ondelete="CASCADE"), nullable=False
    )

    transaction = relationship("Transaction", back_populates="tags")
    tag = relationship("Tag", back_populates="transactions")