import os
import tempfile
from pathlib import Path
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
IS_VERCEL = os.getenv("VERCEL") == "1" or os.getenv("VERCEL_ENV") is not None
DEFAULT_STORAGE_DIR = tempfile.gettempdir() if IS_VERCEL else BASE_DIR

class Settings(BaseSettings):
    PROJECT_NAME: str = "Rokhas API"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super_secret_key_change_me_in_production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    
    BASE_DIR: str = BASE_DIR
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(DEFAULT_STORAGE_DIR, 'rokhas.db')}")
    
    # File uploads configuration
    UPLOADS_DIR: str = os.getenv("UPLOADS_DIR", os.path.join(DEFAULT_STORAGE_DIR, "uploads"))
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50MB

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @field_validator("DATABASE_URL")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        if value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql://", 1)
        return value

settings = Settings()

# Ensure uploads directory exists
try:
    Path(settings.UPLOADS_DIR).mkdir(parents=True, exist_ok=True)
except OSError as exc:
    print(f"Could not create uploads directory {settings.UPLOADS_DIR}: {exc}")
