from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_active_user, get_current_admin_user
from app.models.user import User
from app.schemas.dossier import DossierCreate, DossierResponse, DossierUpdate
from app.crud import dossier as crud_dossier
from app.services.agent_client import verify_dossier_with_agent

router = APIRouter()

@router.post("/", response_model=DossierResponse)
def create_dossier(
    dossier: DossierCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return crud_dossier.create_dossier(db=db, dossier=dossier, owner_id=current_user.id)

@router.get("/", response_model=List[DossierResponse])
def read_dossiers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role == "admin":
        return crud_dossier.get_all_dossiers(db, skip=skip, limit=limit)
    return crud_dossier.get_dossiers_by_owner(db, owner_id=current_user.id, skip=skip, limit=limit)

@router.get("/{dossier_id}", response_model=DossierResponse)
def read_dossier(
    dossier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_dossier = crud_dossier.get_dossier(db, dossier_id=dossier_id)
    if db_dossier is None:
        raise HTTPException(status_code=404, detail="Dossier not found")
    if current_user.role != "admin" and db_dossier.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    return db_dossier

@router.patch("/{dossier_id}/status", response_model=DossierResponse)
def update_dossier_status(
    dossier_id: int,
    status_update: DossierUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_dossier = crud_dossier.get_dossier(db, dossier_id=dossier_id)
    if db_dossier is None:
        raise HTTPException(status_code=404, detail="Dossier not found")
    return crud_dossier.update_dossier(db, db_dossier, status_update)

@router.post("/{dossier_id}/verify-compliance")
async def verify_compliance(
    dossier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Sends the dossier to the Agent microservice for RGC compliance verification
    and stores the AI analysis back into the database.
    """
    db_dossier = crud_dossier.get_dossier(db, dossier_id=dossier_id)
    if db_dossier is None:
        raise HTTPException(status_code=404, detail="Dossier not found")

    dossier_data = {
        "type": db_dossier.type,
        "hauteur": db_dossier.hauteur,
        "recul": db_dossier.recul,
        "emprise": db_dossier.emprise,
        "surface_terrain": db_dossier.surface_terrain,
        "zone": db_dossier.zone
    }
    
    agent_response = await verify_dossier_with_agent(dossier_data)
    
    # Save the AI response back to the dossier
    update_data = DossierUpdate(ai_analysis=agent_response.get("answer", ""))
    updated_dossier = crud_dossier.update_dossier(db, db_dossier, update_data)
    
    return {"message": "Compliance verified", "dossier": updated_dossier, "agent_sources": agent_response.get("sources", [])}
