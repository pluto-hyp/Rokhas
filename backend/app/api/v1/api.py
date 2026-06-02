from fastapi import APIRouter
from . import auth, users, dossiers, agent, businesses, business_permits, evaluations, citizens, reports, notifications

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(dossiers.router, prefix="/dossiers", tags=["dossiers"])
api_router.include_router(agent.router, prefix="/agent", tags=["agent"])
api_router.include_router(businesses.router, prefix="/businesses", tags=["businesses"])
api_router.include_router(business_permits.router, prefix="/business-permits", tags=["business-permits"])
api_router.include_router(evaluations.router, prefix="/evaluations", tags=["evaluations"])
api_router.include_router(citizens.router, prefix="/citizens", tags=["citizens"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
