from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from app.core.database import Base, engine
from sqlalchemy import inspect, text

Base.metadata.create_all(bind=engine)

def ensure_dossier_columns():
    """Keep local SQLite databases compatible when models gain nullable columns."""
    inspector = inspect(engine)
    if "dossiers" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("dossiers")}
    sqlite_columns = {
        "owner_name": "VARCHAR",
        "owner_cin": "VARCHAR",
        "land_reference": "VARCHAR",
        "municipal_fee_amount": "FLOAT",
        "municipal_fee_receipt": "VARCHAR",
        "municipal_fee_paid": "BOOLEAN NOT NULL DEFAULT 0",
        "permit_documents": "JSON NOT NULL DEFAULT '[]'",
        "signed_by": "VARCHAR",
        "signature_hash": "VARCHAR",
        "signed_at": "DATETIME",
    }

    if engine.dialect.name != "sqlite":
        return

    with engine.begin() as connection:
        for column_name, column_type in sqlite_columns.items():
            if column_name not in existing_columns:
                connection.execute(text(f"ALTER TABLE dossiers ADD COLUMN {column_name} {column_type}"))

ensure_dossier_columns()

def ensure_business_columns():
    """Ensure business table has signature columns for digital approval."""
    inspector = inspect(engine)
    if "businesses" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("businesses")}
    sqlite_columns = {
        "signed_by": "VARCHAR",
        "signature_hash": "VARCHAR",
        "signed_at": "DATETIME",
    }

    if engine.dialect.name != "sqlite":
        return

    with engine.begin() as connection:
        for column_name, column_type in sqlite_columns.items():
            if column_name not in existing_columns:
                connection.execute(text(f"ALTER TABLE businesses ADD COLUMN {column_name} {column_type}"))

ensure_business_columns()

def ensure_business_permit_columns():
    """Ensure business_permits table exists and has required columns."""
    inspector = inspect(engine)
    if "business_permits" not in inspector.get_table_names():
        # Table will be created by SQLAlchemy models
        return

    existing_columns = {column["name"] for column in inspector.get_columns("business_permits")}
    sqlite_columns = {
        "permit_documents": "JSON NOT NULL DEFAULT '[]'",
        "signed_by": "VARCHAR",
        "signature_hash": "VARCHAR",
        "signed_at": "DATETIME",
    }

    if engine.dialect.name != "sqlite":
        return

    with engine.begin() as connection:
        for column_name, column_type in sqlite_columns.items():
            if column_name not in existing_columns:
                connection.execute(text(f"ALTER TABLE business_permits ADD COLUMN {column_name} {column_type}"))

ensure_business_permit_columns()

def ensure_notifications_columns():
    """Ensure notifications table has business_permit_id column."""
    inspector = inspect(engine)
    if "notifications" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("notifications")}
    
    if "business_permit_id" not in existing_columns:
        if engine.dialect.name == "sqlite":
            with engine.begin() as connection:
                connection.execute(text(
                    "ALTER TABLE notifications ADD COLUMN business_permit_id INTEGER"
                ))
        else:
            # PostgreSQL or other DB
            with engine.begin() as connection:
                connection.execute(text(
                    "ALTER TABLE notifications ADD COLUMN business_permit_id INTEGER REFERENCES business_permits(id) ON DELETE CASCADE"
                ))

ensure_notifications_columns()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "Welcome to the Rokhas API. Visit /docs for the Swagger UI."}
