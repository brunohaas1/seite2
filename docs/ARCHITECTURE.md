# Seite2 - Sistema Financeiro Completo (SaaS)

## Arquitetura do Sistema

### 1. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 15)                │
│  ┌─────────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │  Pages/App   │ │  State   │ │  UI Components       │ │
│  │  Router      │ │  Zustand │ │  Shadcn/UI + Tailwind│ │
│  └──────┬───────┘ └──────────┘ └──────────────────────┘ │
│         │              │                                 │
│  ┌──────┴──────────────┴──────────────────────────────┐ │
│  │           TanStack Query (React Query)              │ │
│  └──────────────────────┬─────────────────────────────┘ │
│                         │                                │
│  ┌──────────────────────┴─────────────────────────────┐ │
│  │           Axios Client + WebSockets                 │ │
│  └──────────────────────┬─────────────────────────────┘ │
└─────────────────────────┼───────────────────────────────┘
                          │ HTTPS/WSS
┌─────────────────────────┼───────────────────────────────┐
│                  NGINX (Reverse Proxy)                   │
│                  Rate Limiting + SSL                     │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────┐
│                    BACKEND (FastAPI)                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │  API Layer (REST + WebSocket)                    │   │
│  │  Swagger/OpenAPI Documentation                   │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  Service Layer (Business Logic)                  │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌────────┐ ┌─────┐ │   │
│  │  │Auth  │ │User  │ │Finance│ │OCR     │ │AI   │ │   │
│  │  │Service│ │Service│ │Service│ │Service │ │Service│ │   │
│  │  └──────┘ └──────┘ └──────┘ └────────┘ └─────┘ │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  Repository Layer (Data Access)                  │   │
│  │  SQLAlchemy ORM + Repository Pattern             │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┼────────────────────────────────────┐
│         ┌──────────┴──────────┐                         │
│         │     PostgreSQL      │                         │
│         │   (Primary DB)      │                         │
│         └─────────────────────┘                         │
│         ┌─────────────────────┐                         │
│         │       Redis         │                         │
│         │  (Cache + Queue)    │                         │
│         └─────────────────────┘                         │
│         ┌─────────────────────┐                         │
│         │     MinIO/S3        │                         │
│         │  (File Storage)     │                         │
│         └─────────────────────┘                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                CELERY (Background Tasks)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ OCR      │ │ AI       │ │ Import   │ │ Notify   │  │
│  │ Worker   │ │ Worker   │ │ Worker   │ │ Worker   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 2. Clean Architecture / DDD Structure

```
src/
├── domain/                    # Enterprise Business Rules
│   ├── entities/             # Core domain entities
│   ├── value_objects/        # Value objects
│   ├── aggregates/           # Aggregate roots
│   ├── repositories/         # Repository interfaces
│   ├── services/             # Domain services
│   └── events/               # Domain events
│
├── application/               # Application Business Rules
│   ├── use_cases/            # Application use cases
│   ├── dto/                  # Data Transfer Objects
│   ├── interfaces/           # Interface adapters
│   └── mappers/              # Entity <-> DTO mappers
│
├── infrastructure/           # External concerns
│   ├── persistence/          # Database implementations
│   │   ├── models/           # SQLAlchemy models
│   │   ├── repositories/     # Repository implementations
│   │   └── migrations/       # Alembic migrations
│   ├── external_services/    # External APIs
│   │   ├── ocr/             # OCR services (PaddleOCR, etc.)
│   │   ├── ai/              # AI services (OpenAI, Ollama)
│   │   ├── email/           # Email service
│   │   └── storage/         # File storage (MinIO/S3)
│   ├── cache/               # Redis cache
│   └── queue/               # Celery tasks
│
├── api/                      # Interface Adapters
│   ├── routes/              # API endpoints
│   ├── middleware/           # Middleware
│   ├── dependencies/        # FastAPI dependencies
│   ├── websocket/           # WebSocket handlers
│   └── schemas/             # Pydantic schemas
│
├── core/                     # Cross-cutting concerns
│   ├── config/              # Settings management
│   ├── security/            # JWT, OAuth, encryption
│   ├── logging/             # Logging configuration
│   └── exceptions/          # Custom exceptions
│
└── main.py                   # Application entry point
```

### 3. Fluxo OCR + IA

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Upload  │───>│  OCR     │───>│  IA      │───>│  Tela    │
│  Arquivo │    │  Process │    │  Interpret│    │  Confirm │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │              │               │               │
     ▼              ▼               ▼               ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Múltiplos│    │ PaddleOCR│    │ OpenAI   │    │ Editar   │
│  Formatos │    │ Tesseract│    │ Ollama   │    │ Campos   │
│  PDF/IMG  │    │ EasyOCR  │    │ OpenRouter│   │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                      │               │
                                      ▼               ▼
                                ┌──────────┐    ┌──────────┐
                                │ Categoriz│    │  Salvar  │
                                │ Automática│   │  Transac │
                                └──────────┘    └──────────┘
```

### 4. Fluxo IA Financeira

```
┌─────────────────────────────────────────────────────────┐
│                   Chat IA Financeiro                    │
│  "Quanto gastei com comida esse mês?"                   │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────┐
│  Query Processing Layer                                 │
│  1. Parse natural language                              │
│  2. Identify intent (query/analysis/prediction)         │
│  3. Extract entities (date range, category, amount)      │
│  4. Map to database fields                              │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────┐
│  Data Retrieval Layer                                   │
│  1. Fetch from PostgreSQL via repository                │
│  2. Check Redis cache                                   │
│  3. Aggregate data                                      │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────┐
│  AI Processing Layer                                    │
│  1. Format data for LLM input                           │
│  2. Call OpenAI / Ollama / OpenRouter                   │
│  3. Process response                                    │
│  4. Generate natural language answer                    │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────┐
│  Response Layer                                         │
│  1. Return structured response                          │
│  2. Include chart data if applicable                    │
│  3. Cache response                                      │
│  4. Log interaction                                     │
└─────────────────────────────────────────────────────────┘
```

### 5. APIs Principais

```
API REST:
├── /api/v1/auth/            # Autenticação
│   ├── POST /register       # Cadastro
│   ├── POST /login          # Login
│   ├── POST /google         # Google OAuth
│   ├── POST /github         # GitHub OAuth
│   ├── POST /refresh        # Refresh token
│   ├── POST /logout         # Logout
│   ├── POST /forgot-password
│   └── POST /2fa/verify     # 2FA
│
├── /api/v1/users/           # Usuários
│   ├── GET /me              # Perfil
│   ├── PUT /me              # Atualizar perfil
│   ├── PUT /me/photo        # Foto
│   └── GET /me/preferences  # Preferências
│
├── /api/v1/transactions/    # Transações
│   ├── GET /                # Listar
│   ├── POST /               # Criar
│   ├── GET /{id}            # Detalhe
│   ├── PUT /{id}            # Atualizar
│   ├── DELETE /{id}         # Excluir
│   ├── POST /batch          # Lote
│   └── GET /search          # Busca
│
├── /api/v1/accounts/        # Contas
├── /api/v1/cards/           # Cartões
├── /api/v1/categories/      # Categorias
├── /api/v1/budgets/         # Orçamentos
├── /api/v1/goals/          # Metas
├── /api/v1/investments/     # Investimentos
├── /api/v1/ocr/            # OCR
├── /api/v1/ai/             # IA
├── /api/v1/reports/        # Relatórios
├── /api/v1/import/         # Importação
├── /api/v1/pix/            # PIX
├── /api/v1/notifications/  # Notificações
├── /api/v1/admin/          # Administrativo
└── /api/v1/webhooks/       # Webhooks

WebSockets:
├── /ws/dashboard/           # Dashboard em tempo real
├── /ws/ocr/                 # Status OCR
└── /ws/notifications/       # Notificações push
```

### 6. Banco de Dados (Tabelas Principais)

```sql
-- Core Tables
users, accounts, cards, categories, subcategories,
transactions, installments, budgets, goals,
investments, investment_transactions,

-- OCR & AI
ocr_documents, ocr_results, ai_conversations,
ai_analyses, ai_predictions,

-- Support
attachments, tags, transaction_tags,
notifications, notification_templates,
user_preferences, user_sessions,
access_logs, audit_logs,

-- Auth & Security
refresh_tokens, oauth_accounts,
two_factor_backup_codes,
device_sessions,

-- System
webhooks, webhook_events,
import_logs, import_mappings,
background_tasks
```

### 7. Design System

```
Cores Primárias:
  - Primary: #6C5CE7 (Roxo)
  - Secondary: #00B894 (Verde)
  - Accent: #FD79A8 (Rosa)

Cores Funcionais:
  - Success: #00B894
  - Warning: #FDCB6E
  - Error: #E17055
  - Info: #74B9FF

Tipografia:
  - Font: Inter (Google Fonts)
  - Headings: 700, 600
  - Body: 400
  - Mono: JetBrains Mono (código/valores)

Espaçamento:
  - Base: 4px (multiplicador)
  - Container max-width: 1200px

Glassmorphism:
  - Background: rgba(255, 255, 255, 0.1)
  - Blur: blur(10px)
  - Border: 1px solid rgba(255, 255, 255, 0.2)

Animações:
  - Framer Motion
  - Transitions: 0.3s ease
  - Page transitions: 0.5s
```

### 8. Plano de Desenvolvimento (Sprints)

```
SPRINT 1: Fundação (2 semanas)
  - Setup do projeto Next.js + FastAPI
  - Docker + Docker Compose
  - Banco de dados + migrations
  - Autenticação completa
  - Sistema de usuários

SPRINT 2: Core Financeiro (3 semanas)
  - Contas e cartões
  - Categorias
  - Transações (CRUD completo)
  - Lançamentos parcelados
  - Transferências

SPRINT 3: Dashboard & Relatórios (2 semanas)
  - Dashboard principal
  - Gráficos interativos
  - Filtros e buscas
  - Relatórios PDF/Excel

SPRINT 4: OCR (2 semanas)
  - Upload de documentos
  - Integração PaddleOCR/Tesseract
  - Tela de confirmação
  - Extração automática de dados

SPRINT 5: IA Financeira (2 semanas)
  - Chat com IA
  - Análise de gastos
  - Categorização automática
  - Previsões financeiras

SPRINT 6: Importação & Integrações (2 semanas)
  - Importar CSV/OFX/QIF
  - Integração bancária
  - Webhooks
  - API completa

SPRINT 7: Metas & Orçamentos (1 semana)
  - Metas financeiras
  - Orçamentos mensais
  - Alertas e notificações

SPRINT 8: Investimentos (2 semanas)
  - Carteira de investimentos
  - Cotações em tempo real
  - Gráficos de performance
  - Dividendos

SPRINT 9: PIX & Pagamentos (1 semana)
  - Registro PIX
  - QR Code
  - Comprovantes

SPRINT 10: Admin & Segurança (2 semanas)
  - Painel administrativo
  - Logs e auditoria
  - Backup automático
  - LGPD compliance

SPRINT 11: Performance & Testes (2 semanas)
  - Testes unitários (90%+)
  - Testes E2E
  - Performance optimization
  - Cache tuning

SPRINT 12: Polimento & Deploy (2 semanas)
  - PWA
  - Modo offline
  - Internacionalização
  - Documentação completa
  - Deploy produção
```

### 9. Roadmap

```
MÊS 1:
  ├── Sprint 1: Fundação ✅
  ├── Sprint 2: Core Financeiro
  └── Sprint 3: Dashboard

MÊS 2:
  ├── Sprint 4: OCR
  ├── Sprint 5: IA Financeira
  └── Sprint 6: Importação

MÊS 3:
  ├── Sprint 7: Metas & Orçamentos
  ├── Sprint 8: Investimentos
  └── Sprint 9: PIX

MÊS 4:
  ├── Sprint 10: Admin & Segurança
  ├── Sprint 11: Testes
  └── Sprint 12: Deploy
```

### 10. Tecnologias e Versões

```
Frontend:
  - Next.js 15.0.0
  - React 19.0.0
  - TypeScript 5.6
  - TailwindCSS 3.4
  - Shadcn/UI latest
  - Framer Motion 11
  - TanStack Query 5
  - Zustand 5
  - React Hook Form 7
  - Zod 3.23

Backend:
  - FastAPI 0.115
  - Python 3.13
  - SQLAlchemy 2.0
  - Alembic 1.13
  - Pydantic 2.9
  - Celery 5.4
  - Redis 7.4
  - PostgreSQL 16

DevOps:
  - Docker 27+
  - Docker Compose V2
  - NGINX 1.27
  - MinIO latest
```

### 11. Segurança

```
Autenticação:
  - JWT com RS256
  - Refresh tokens rotativos
  - 2FA com TOTP
  - OAuth2 (Google, GitHub)
  - Sessões com controle de dispositivo

Criptografia:
  - AES-256-GCM para dados sensíveis
  - Argon2id para senhas
  - HTTPS/TLS 1.3
  - CSRF tokens
  - Rate limiting (100 req/min)

Headers de Segurança:
  - Content-Security-Policy
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Strict-Transport-Security
  - X-XSS-Protection

GDPR/LGPD:
  - Consentimento explícito
  - Direito à exclusão
  - Portabilidade de dados
  - Logs de acesso
  - Data retention policy