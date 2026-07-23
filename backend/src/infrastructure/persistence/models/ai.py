"""AI conversation and analysis models."""

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, UUIDMixin, SoftDeleteMixin


class AIConversation(UUIDMixin, TimestampMixin, Base):
    """AI chat conversation model."""

    __tablename__ = "ai_conversations"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=True)
    messages: Mapped[str] = mapped_column(Text, nullable=True)
    context: Mapped[str | None] = mapped_column(Text, nullable=True)
    model_used: Mapped[str] = mapped_column(String(100), nullable=True)
    tokens_used: Mapped[int | None] = mapped_column(
        String(10), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    user = relationship("User")


class AIAnalysis(UUIDMixin, TimestampMixin, Base):
    """AI financial analysis model."""

    __tablename__ = "ai_analyses"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    analysis_type: Mapped[str] = mapped_column(String(50), nullable=False)
    period_start: Mapped[DateTime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    period_end: Mapped[DateTime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    input_data: Mapped[str | None] = mapped_column(Text, nullable=True)
    result: Mapped[str | None] = mapped_column(Text, nullable=True)
    recommendations: Mapped[str | None] = mapped_column(Text, nullable=True)
    confidence_score: Mapped[float | None] = mapped_column(
        Numeric(5, 2), nullable=True
    )
    model_used: Mapped[str | None] = mapped_column(String(100), nullable=True)

    user = relationship("User")


class AIPrediction(UUIDMixin, TimestampMixin, Base):
    """AI financial prediction model."""

    __tablename__ = "ai_predictions"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    prediction_type: Mapped[str] = mapped_column(String(50), nullable=False)
    predicted_value: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    confidence: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    prediction_date: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    actual_value: Mapped[float | None] = mapped_column(
        Numeric(15, 2), nullable=True
    )
    metadata_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    user = relationship("User")