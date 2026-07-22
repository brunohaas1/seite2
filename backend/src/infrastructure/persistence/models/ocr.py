"""OCR document and result models."""

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, UUIDMixin


class OCRDocument(UUIDMixin, TimestampMixin, Base):
    """OCR document upload model."""

    __tablename__ = "ocr_documents"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    filename: Mapped[str] = mapped_column(String(500), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(500), nullable=False)
    file_path: Mapped[str] = mapped_column(String(1000), nullable=False)
    file_size: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)
    mime_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    ocr_engine: Mapped[str | None] = mapped_column(String(50), nullable=True)
    processing_time: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    raw_text: Mapped[str | None] = mapped_column(Text, nullable=True)

    user = relationship("User")
    results: Mapped[list["OCRResult"]] = relationship(
        "OCRResult", back_populates="document",
        cascade="all, delete-orphan",
    )


class OCRResult(UUIDMixin, TimestampMixin, Base):
    """OCR extraction result model."""

    __tablename__ = "ocr_results"

    document_id: Mapped[str] = mapped_column(
        ForeignKey("ocr_documents.id", ondelete="CASCADE"), nullable=False
    )
    transaction_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    amount: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    date: Mapped[DateTime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    due_date: Mapped[DateTime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    company_name: Mapped[str | None] = mapped_column(String(500), nullable=True)
    document_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    cnpj: Mapped[str | None] = mapped_column(String(18), nullable=True)
    cpf: Mapped[str | None] = mapped_column(String(14), nullable=True)
    payment_method: Mapped[str | None] = mapped_column(String(50), nullable=True)
    category: Mapped[str | None] = mapped_column(String(255), nullable=True)
    installments: Mapped[str | None] = mapped_column(String(10), nullable=True)
    installment_number: Mapped[str | None] = mapped_column(String(10), nullable=True)
    bank_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    agency: Mapped[str | None] = mapped_column(String(20), nullable=True)
    account: Mapped[str | None] = mapped_column(String(20), nullable=True)
    barcode: Mapped[str | None] = mapped_column(String(100), nullable=True)
    digitable_line: Mapped[str | None] = mapped_column(String(100), nullable=True)
    pix_key: Mapped[str | None] = mapped_column(String(255), nullable=True)
    pix_qr_code: Mapped[str | None] = mapped_column(Text, nullable=True)
    confidence_score: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    is_confirmed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    raw_data: Mapped[str | None] = mapped_column(Text, nullable=True)

    document: Mapped["OCRDocument"] = relationship("OCRDocument", back_populates="results")


if TYPE_CHECKING:
    pass