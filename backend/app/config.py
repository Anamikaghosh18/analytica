import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    database_url: str = "postgresql://localhost:5432/analytica"
    database_url_internal: Optional[str] = None

    redis_url: str = "redis://localhost:6379/0"
    secret_key: str = "supersecret01"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    api_key_header: str = "X-API-Key"
    
    google_client_id: Optional[str] = os.getenv("GOOGLE_CLIENT_ID")

    # Environment
    environment: str = "development"
    
    # Monitoring defaults
    default_check_timeout: int = 30
    max_concurrent_checks: int = 5
    
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        case_sensitive=False,
        extra="ignore"
    )

    def get_database_url(self) -> str:
        """Returns the correct database URL for current environment"""
        if self.environment == "production":
            return self.database_url_internal or self.database_url
        return self.database_url


settings = Settings()

if settings.environment == "production" and settings.database_url_internal:
    settings.database_url = settings.database_url_internal