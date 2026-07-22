"""AI routes for financial assistant."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies.auth import get_current_user
from src.api.schemas.ai import AIQueryRequest, AIQueryResponse
from src.infrastructure.persistence.database import get_db
from src.infrastructure.persistence.models.user import User
from src.infrastructure.persistence.models.ai import AIConversation, AIAnalysis
from src.infrastructure.persistence.models.transaction import Transaction
from src.core.config import settings

ai_router = APIRouter(prefix="/api/v1/ai", tags=["AI"])


@ai_router.post("/query", response_model=AIQueryResponse)
async def ai_query(
    request: AIQueryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a query to the AI financial assistant."""
    query_text = request.query.lower()

    if not settings.FEATURE_AI_ENABLED:
        raise HTTPException(status_code=503, detail="AI features are disabled")

    # Get or create conversation
    if request.conversation_id:
        result = await db.execute(
            select(AIConversation).where(
                AIConversation.id == request.conversation_id,
                AIConversation.user_id == current_user.id,
            )
        )
        conversation = result.scalar_one_or_none()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = AIConversation(user_id=current_user.id)
        db.add(conversation)
        await db.flush()

    # Extract financial data based on query
    response_data = await _process_financial_query(query_text, current_user.id, db)

    response_text = response_data.get("response", "")
    chart_data = response_data.get("chart_data")

    # Try to use OpenAI if available
    if settings.OPENAI_API_KEY:
        try:
            from src.infrastructure.external_services.ai.openai_service import query_ai
            ai_response = await query_ai(
                query=request.query,
                context=response_text,
                user_name=current_user.name,
            )
            response_text = ai_response
        except Exception:
            pass

    return AIQueryResponse(
        response=response_text,
        conversation_id=conversation.id,
        data=chart_data,
    )


async def _process_financial_query(query: str, user_id: uuid.UUID, db) -> dict:
    """Process financial queries and return data."""
    today = datetime.now(timezone.utc)

    # Get current period totals
    month_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    income = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.user_id == user_id,
            Transaction.type == "income",
            Transaction.date >= month_start,
            Transaction.is_deleted.is_(False),
            Transaction.is_confirmed == True,
        )
    )
    expense = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.date >= month_start,
            Transaction.is_deleted.is_(False),
            Transaction.is_confirmed == True,
        )
    )
    total_income = float(income.scalar() or 0)
    total_expense = float(expense.scalar() or 0)

    # Get top spending categories
    categories = await db.execute(
        select(
            Transaction.category_id,
            func.sum(Transaction.amount).label("total"),
        )
        .where(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.date >= month_start,
            Transaction.is_deleted.is_(False),
            Transaction.is_confirmed == True,
        )
        .group_by(Transaction.category_id)
        .order_by(func.sum(Transaction.amount).desc())
        .limit(5)
    )
    top_categories = categories.all()

    response_parts = [
        f"📊 **Resumo Financeiro - {today.strftime('%B/%Y')}**\n",
        f"💰 **Receitas:** R$ {total_income:,.2f}",
        f"💸 **Despesas:** R$ {total_expense:,.2f}",
        f"📈 **Saldo:** R$ {total_income - total_expense:,.2f}",
    ]

    if "gastei" in query or "gasto" in query or "despesa" in query:
        response_parts.append(f"\n💳 **Total de gastos no mês:** R$ {total_expense:,.2f}")
        if top_categories:
            response_parts.append("\n📋 **Principais categorias de gasto:**")
            for cat_id, total in top_categories:
                response_parts.append(f"  • Categoria: R$ {float(total):,.2f}")

    if "economizei" in query or "economia" in query or "sobrou" in query:
        savings = total_income - total_expense
        if savings > 0:
            response_parts.append(f"\n🎉 **Você economizou R$ {savings:,.2f} este mês!**")
            response_parts.append(f"💡 **Dica:** Tente poupar pelo menos 20% da sua renda.")
        else:
            response_parts.append(f"\n⚠️ **Suas despesas excederam sua renda em R$ {abs(savings):,.2f}**")

    if "investimento" in query or "quanto posso investir" in query:
        savings = total_income - total_expense
        if savings > 0:
            response_parts.append(f"\n📈 **Com base no seu saldo atual, você pode investir até R$ {savings * 0.7:,.2f} por mês**")
            response_parts.append("💡 **Sugestões:** CDB, Tesouro Direto, Fundos Imobiliários")
        else:
            response_parts.append("\n⚠️ **Para investir, primeiro é necessário equilibrar suas finanças**")

    if "planejamento" in query:
        savings = max(total_income - total_expense, 0)
        response_parts.append(f"""
📋 **Planejamento Financeiro Sugerido:**
1️⃣ **Reserva de Emergência:** 6 meses de despesas (R$ {total_expense * 6:,.2f})
2️⃣ **Investimentos:** {savings * 0.4:,.2f}/mês em renda fixa
3️⃣ **Metas:** Defina objetivos de curto, médio e longo prazo
4️⃣ **Revisão Mensal:** Acompanhe seus gastos regularmente
""")

    return {
        "response": "\n".join(response_parts),
        "chart_data": {
            "income": total_income,
            "expense": total_expense,
        },
    }


@ai_router.post("/analyze")
async def analyze_finances(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Analyze user finances with AI."""
    today = datetime.now(timezone.utc)
    month_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    income = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.user_id == current_user.id,
            Transaction.type == "income",
            Transaction.date >= month_start,
            Transaction.is_deleted.is_(False),
            Transaction.is_confirmed == True,
        )
    )
    expense = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.user_id == current_user.id,
            Transaction.type == "expense",
            Transaction.date >= month_start,
            Transaction.is_deleted.is_(False),
            Transaction.is_confirmed == True,
        )
    )

    total_income = float(income.scalar() or 0)
    total_expense = float(expense.scalar() or 0)

    analysis = AIAnalysis(
        user_id=current_user.id,
        analysis_type="monthly",
        period_start=month_start,
        period_end=today,
        result=f"Income: {total_income}, Expense: {total_expense}",
    )
    db.add(analysis)
    await db.flush()

    return {
        "analysis": "Análise mensal concluída",
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": total_income - total_expense,
        "health_score": min(100, int((total_income - total_expense) / max(total_income, 1) * 100 + 50)),
    }


@ai_router.get("/conversations")
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List AI conversations."""
    result = await db.execute(
        select(AIConversation)
        .where(
            AIConversation.user_id == current_user.id,
            AIConversation.is_active == True,
        )
        .order_by(AIConversation.created_at.desc())
        .limit(20)
    )
    return [
        {
            "id": str(c.id),
            "title": c.title or "Conversa",
            "created_at": c.created_at.isoformat(),
        }
        for c in result.scalars().all()
    ]