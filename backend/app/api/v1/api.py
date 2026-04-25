from fastapi import APIRouter
from . import auth, users, dossiers, agent

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(dossiers.router, prefix="/dossiers", tags=["dossiers"])
api_router.include_router(agent.router, prefix="/agent", tags=["agent"])
