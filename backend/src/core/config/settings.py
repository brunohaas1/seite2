"""Application settings management using Pydantic Settings."""

from typing import Optional, List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # App
    APP_NAME: str = "Seite2"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "Sistema Financeiro Completo (SaaS)"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/seite2",
        alias="DATABASE_URL",
    )
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10
    DATABASE_ECHO: bool = False

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_MAX_CONNECTIONS: int = 10

    # JWT
    JWT_SECRET_KEY: str = Field(
        default="your-secret-key-change-in-production",
        alias="JWT_SECRET_KEY",
    )
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    JWT_PRIVATE_KEY_PATH: Optional[str] = None
    JWT_PUBLIC_KEY_PATH: Optional[str] = None

    # OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[str] = None

    # 2FA
    TWO_FACTOR_ISSUER: str = "Seite2"

    # Encryption
    ENCRYPTION_KEY: str = Field(
        default="your-encryption-key-change-in-production-32bytes",
        alias="ENCRYPTION_KEY",
    )

    # Argon2
    ARGON2_TIME_COST: int = 3
    ARGON2_MEMORY_COST: int = 65536
    ARGON2_PARALLELISM: int = 4

    # OCR
    OCR_DEFAULT_ENGINE: str = "paddleocr"
    OCR_SUPPORTED_EXTENSIONS: List[str] = [
        ".jpg", ".jpeg", ".png", ".pdf", ".bmp", ".tiff", ".webp",
    ]
    OCR_MAX_FILE_SIZE_MB: int = 20
    OCR_TESSERACT_LANG: str = "por+eng"
    OCR_PADDLE_LANG: str = "en"

    # AI
    AI_PROVIDER: str = "openai"
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"
    OPENROUTER_API_KEY: Optional[str] = None
    OPENROUTER_MODEL: str = "gpt-4o-mini"

    # MinIO / S3
    STORAGE_PROVIDER: str = "minio"
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "seite2"
    MINIO_SECURE: bool = False
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    AWS_BUCKET: Optional[str] = None

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    CELERY_TASK_TRACK_STARTED: bool = True
    CELERY_TASK_SERIALIZER: str = "json"
    CELERY_RESULT_SERIALIZER: str = "json"
    CELERY_ACCEPT_CONTENT: List[str] = ["json"]

    # Email
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM: Optional[str] = None
    SMTP_USE_TLS: bool = True

    # WhatsApp / Telegram
    WHATSAPP_API_TOKEN: Optional[str] = None
    TELEGRAM_BOT_TOKEN: Optional[str] = None

    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_PERIOD_SECONDS: int = 60

    # Security
    CORS_ENABLED: bool = True
    CSRF_ENABLED: bool = True
    HSTS_ENABLED: bool = True
    CONTENT_SECURITY_POLICY: str = "default-src 'self'"

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    LOG_FILE: Optional[str] = None
    SENTRY_DSN: Optional[str] = None

    # Backup
    BACKUP_ENABLED: bool = True
    BACKUP_SCHEDULE: str = "0 3 * * *"
    BACKUP_RETENTION_DAYS: int = 30
    BACKUP_PATH: str = "/backups"

    # PWA
    PWA_ENABLED: bool = True
    PWA_NAME: str = "Seite2"
    PWA_SHORT_NAME: str = "Seite2"
    PWA_DESCRIPTION: str = "Sistema Financeiro Completo"

    # Cache
    CACHE_TTL_DEFAULT: int = 300
    CACHE_TTL_DASHBOARD: int = 60
    CACHE_TTL_QUOTES: int = 300

    # WebSocket
    WS_HEARTBEAT_INTERVAL: int = 30
    WS_MAX_CONNECTIONS_PER_USER: int = 5

    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    # Feature Flags
    FEATURE_OCR_ENABLED: bool = True
    FEATURE_AI_ENABLED: bool = True
    FEATURE_INVESTMENTS_ENABLED: bool = True
    FEATURE_PIX_ENABLED: bool = True
    FEATURE_IMPORT_ENABLED: bool = True
    FEATURE_MULTI_CURRENCY: bool = True
    FEATURE_MULTI_COMPANY: bool = True


def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()