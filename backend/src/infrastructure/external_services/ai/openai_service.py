"""OpenAI service for AI financial assistant."""

from typing import Optional

from src.core.config import settings


async def query_ai(
    query: str,
    context: str = "",
    user_name: str = "Usuário",
) -> str:
    """Send query to OpenAI and get response."""
    if not settings.OPENAI_API_KEY:
        return context

    try:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

        system_prompt = f"""Você é um assistente financeiro especialista do Seite2.
        O usuário se chama {user_name}.
        Use os dados financeiros fornecidos para responder de forma clara e amigável.
        Dê dicas práticas de economia e investimentos.
        Responda em português brasileiro.
        Seja conciso mas completo."""

        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Contexto financeiro:\n{context}\n\nPergunta: {query}"},
            ],
            max_tokens=500,
            temperature=0.7,
        )

        return response.choices[0].message.content or context

    except Exception as e:
        return f"{context}\n\n(Assistente local - OpenAI indisponível: {str(e)})"


async def analyze_text(text: str) -> dict:
    """Analyze text with AI to extract financial data."""
    if not settings.OPENAI_API_KEY:
        return {"error": "OpenAI not configured"}

    try:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": """Extraia informações financeiras do texto fornecido.
                    Retorne APENAS um JSON válido com os campos:
                    - amount (valor numérico)
                    - date (data no formato ISO)
                    - description (descrição)
                    - company (empresa/estabelecimento)
                    - category (categoria: alimentacao, transporte, saude, educacao, lazer, compras, servicos, outros)
                    - payment_method (credito, debito, dinheiro, pix)
                    - document_number (número do documento se houver)
                    Se não encontrar um campo, retorne null.""",
                },
                {"role": "user", "content": text},
            ],
            max_tokens=300,
            temperature=0.1,
        )

        import json
        content = response.choices[0].message.content
        return json.loads(content)

    except Exception as e:
        return {"error": str(e)}


async def categorize_transaction(description: str, amount: float) -> str:
    """Categorize a transaction based on description."""
    if not settings.OPENAI_API_KEY:
        return "outros"

    try:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": """Categorize a transação financeira.
                    Retorne APENAS uma palavra: alimentacao, transporte, saude, educacao, 
                    lazer, compras, moradia, assinaturas, servicos, salario, investimentos, outros""",
                },
                {
                    "role": "user",
                    "content": f"Descrição: {description}\nValor: R$ {amount:.2f}",
                },
            ],
            max_tokens=50,
            temperature=0.1,
        )

        return response.choices[0].message.content.strip().lower()

    except Exception:
        return "outros"