"""OCR processing task placeholder."""

import logging

logger = logging.getLogger(__name__)


async def process_ocr_task(document_id, content: str, file_path: str) -> dict:
    """Process OCR on a document. Stub - implement with PaddleOCR/Tesseract."""
    logger.info(f"OCR task received for document {document_id} - placeholder")
    return {"status": "processed", "text": content[:500] if content else ""}
