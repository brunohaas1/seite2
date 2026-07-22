"""AI Pydantic schemas."""

from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class AIQueryRequest(BaseModel):
    """AI chat query request schema."""

    query: str
    conversation_id: Optional[UUID] = None


class AIQueryResponse(BaseModel):
    """AI chat query response schema."""

    response: str
    conversation_id: UUID
    data: Optional[dict] = None
    suggestions: Optional[list[str]] = None


class AIAnalysisRequest(BaseModel):
    """AI analysis request schema."""

    analysis_type: str
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    include_recommendations: bool = True


class AIAnalysisResponse(BaseModel):
    """AI analysis response schema."""

    analysis: str
    insights: Optional[list[str]] = None
    recommendations: Optional[list[str]] = None
    chart_data: Optional[dict] = None
    confidence_score: Optional[float] = None


class AIPredictionRequest(BaseModel):
    """AI prediction request schema."""

    prediction_type: str
    months_ahead: int = 3


class AIPredictionResponse(BaseModel):
    """AI prediction response schema."""

    predictions: list[dict]
    confidence: float
    insights: Optional[list[str]] = None