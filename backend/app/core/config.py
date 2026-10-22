from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    ENVIRONMENT: str = "development"
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Cobalt Console"

    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    DATABASE_URL: str = "sqlite+aiosqlite:///./cobalt.db"

    KEYCLOAK_URL: str = "http://localhost:8080"
    KEYCLOAK_REALM: str = "cobalt"
    KEYCLOAK_CLIENT_ID: str = "cobalt-console"
    KEYCLOAK_CLIENT_SECRET: str = ""

    LLM_PROVIDER: str = "openai-compatible"
    LLM_MODEL: str = ""
    LLM_BASE_URL: str = ""
    LLM_API_KEY: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()