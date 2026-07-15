"""Application configuration via pydantic-settings."""

from __future__ import annotations

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # App
    app_name: str = "Chokey API"
    debug: bool = True
    secret_key: str = "dev-secret-key-change-in-production-min-32-chars!!"

    # Database
    database_url: str = "postgresql+asyncpg://chokey:chokey@localhost:5432/chokey"
    database_read_url: str = ""

    # Connection pooling
    db_pool_size: int = 150
    db_max_overflow: int = 50
    redis_max_connections: int = 200

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # JWT
    jwt_access_expire_minutes: int = 30
    jwt_refresh_expire_days: int = 7
    jwt_algorithm: str = "HS256"

    # CORS
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    # Rate Limiting
    rate_limit_global: int = 300
    rate_limit_auth: int = 5

    # External APIs
    coingecko_api_url: str = "https://api.coingecko.com/api/v3"
    sendgrid_api_key: str = ""

    # AWS / S3
    s3_bucket: str = ""
    s3_region: str = ""
    aws_access_key_id: str = ""
    aws_secret_access_key: SecretStr = SecretStr("")

    # Admin
    admin_email: str = "admin@chokey.app"

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()
