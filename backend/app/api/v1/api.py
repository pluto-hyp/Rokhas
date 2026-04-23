from fastapi import APIRouter
from . import auth, users, dossiers

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(dossiers.router, prefix="/dossiers", tags=["dossiers"])
