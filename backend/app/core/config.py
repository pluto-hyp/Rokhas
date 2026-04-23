import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Rokhas API"
    API_V1_STR: str = "/api/v1"
    
    # SECURITY
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super_secret_key_change_me_in_production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8 # 8 days
    
    # DATABASE
    # Example: postgresql+psycopg2://user:password@localhost:5432/rokhas
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./rokhas.db") # Default to sqlite for quick local testing if no postgres is set

    class Config:
        env_file = ".env"

settings = Settings()
