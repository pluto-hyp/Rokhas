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
    }

    if engine.dialect.name != "sqlite":
        return

    with engine.begin() as connection:
        for column_name, column_type in sqlite_columns.items():
            if column_name not in existing_columns:
                connection.execute(text(f"ALTER TABLE dossiers ADD COLUMN {column_name} {column_type}"))

ensure_dossier_columns()

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
