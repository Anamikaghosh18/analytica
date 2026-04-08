import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Model fields - Pydantic will automatically look for these (case-insensitive)
    # in environment variables and .env file
    database_url: str = "postgresql://localhost:5432/analytica"
    database_url_internal: Optional[str] = None

    redis_url: str = "redis://localhost:6379/0"
    secret_key: str = "supersecret01"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    api_key_header: str = "X-API-Key"
    
    # Environment
    environment: str = "development"
    
    # Monitoring defaults
    default_check_timeout: int = 30
    max_concurrent_checks: int = 5
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore" # Ignore extra fields in .env
    )

    def get_database_url(self) -> str:
        """Returns the correct database URL for current environment"""
        if self.environment == "production":
            return self.database_url_internal or self.database_url
        return self.database_url

# Create singleton instance
settings = Settings()

# Patch the settings with the correct URL if in production
if settings.environment == "production" and settings.database_url_internal:
    settings.database_url = settings.database_url_internal