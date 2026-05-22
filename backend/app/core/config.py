import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Rokhas API"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super_secret_key_change_me_in_production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./rokhas.db")
    
    # File uploads configuration
    UPLOADS_DIR: str = os.getenv("UPLOADS_DIR", os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads"))
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50MB

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

# Ensure uploads directory exists
Path(settings.UPLOADS_DIR).mkdir(parents=True, exist_ok=True)
