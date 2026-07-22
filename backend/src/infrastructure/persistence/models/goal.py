"""Financial goal model."""

from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, UUIDMixin


class Goal(UUIDMixin, TimestampMixin, Base):
    """Financial goal model."""

    __tablename__ = "goals"

    user_id = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = mapped_column(String(255), nullable=False)
    description = mapped_column(Text, nullable=True)
    target_amount = mapped_column(Numeric(15, 2), nullable=False)
    current_amount = mapped_column(Numeric(15, 2), default=0.0, nullable=False)
    type = mapped_column(String(50), nullable=False)
    icon = mapped_column(String(50), nullable=True)
    color = mapped_column(String(7), nullable=True)
    target_date = mapped_column(DateTime(timezone=True), nullable=True)
    start_date = mapped_column(DateTime(timezone=True), nullable=False)
    is_completed = mapped_column(Boolean, default=False, nullable=False)
    is_active = mapped_column(Boolean, default=True, nullable=False)

    user = relationship("User")


if TYPE_CHECKING:
    from .user import User