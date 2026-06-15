from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from .config import settings

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

Base = declarative_base()

try:
    engine = create_engine(
        settings.DATABASE_URL, connect_args=connect_args
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as exc:
    print(f"Database engine creation failed: {exc}")
    engine = None
    SessionLocal = None
