from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api.dependencies import get_db, get_current_active_user
from app.models.dossier import Dossier
from app.models.user import User as UserModel
from app.models.business import Business
from app.models.evaluation import Evaluation

router = APIRouter()

@router.get("/summary")
def get_report_summary(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Returns high-level stats for the dashboard reports.
    """
    total_permits = db.query(Dossier).count()
    approved_permits = db.query(Dossier).filter(Dossier.status == "Approved").count()
    pending_permits = db.query(Dossier).filter(Dossier.status == "Pending").count()
    
    total_citizens = db.query(UserModel).filter(UserModel.role == "citizen").count()
    total_businesses = db.query(Business).count()
    total_evaluations = db.query(Evaluation).count()
    
    category_data = db.query(Dossier.type, func.count(Dossier.id)).group_by(Dossier.type).all()
    categories = {t or "Other": count for t, count in category_data}

    return {
        "permits": {
            "total": total_permits,
            "approved": approved_permits,
            "pending": pending_permits,
            "approval_rate": (approved_permits / total_permits * 100) if total_permits > 0 else 0
        },
        "entities": {
            "citizens": total_citizens,
            "businesses": total_businesses,
            "evaluations": total_evaluations
        },
        "categories": categories
    }
