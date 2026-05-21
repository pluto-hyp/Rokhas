from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_active_user, get_current_admin_user
from app.models.user import User
from app.schemas.dossier import DossierCreate, DossierResponse, DossierUpdate
from app.crud import dossier as crud_dossier
from app.crud import notification as crud_notification
from app.services.agent_client import verify_dossier_with_agent

router = APIRouter()

ARCHITECT_REQUIRED_DOCUMENTS = {
    "building_permit_application",
    "owner_id_card",
    "land_title",
    "architectural_plans",
    "architect_contract",
    "owner_commitment",
    "admin_fee_receipt",
}

def validate_architect_dossier(dossier: DossierCreate):
    provided_docs = {doc.key: doc for doc in dossier.permit_documents}
    missing_docs = sorted(ARCHITECT_REQUIRED_DOCUMENTS - set(provided_docs))
    unapproved_docs = sorted(
        key for key in ARCHITECT_REQUIRED_DOCUMENTS
        if key in provided_docs and not provided_docs[key].approved
    )

    missing_fields = []
    if not dossier.owner_name:
        missing_fields.append("owner_name")
    if not dossier.owner_cin:
        missing_fields.append("owner_cin")
    if not dossier.land_reference:
        missing_fields.append("land_reference")
    if not dossier.municipal_fee_paid or not dossier.municipal_fee_receipt:
        missing_fields.append("municipal_fee_receipt")

    if missing_docs or unapproved_docs or missing_fields:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Architect building permit dossiers must include all mandatory authority documents before submission.",
                "missing_documents": missing_docs,
                "unapproved_documents": unapproved_docs,
                "missing_fields": missing_fields,
            },
        )

@router.post("", response_model=DossierResponse)
async def create_dossier(
    dossier: DossierCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role == "architect" and dossier.type == "Building Permit":
        validate_architect_dossier(dossier)

    db_dossier = crud_dossier.create_dossier(db=db, dossier=dossier, owner_id=current_user.id)
    
    # Trigger automatic compliance check using the Rokhas agent
    dossier_data = {
        "type": db_dossier.type,
        "hauteur": db_dossier.hauteur,
        "recul": db_dossier.recul,
        "emprise": db_dossier.emprise,
        "surface_terrain": db_dossier.surface_terrain,
        "zone": db_dossier.zone
    }
    
    try:
        agent_response = await verify_dossier_with_agent(dossier_data)
        db_dossier.ai_analysis = agent_response.get("answer", "")
        db.commit()
        db.refresh(db_dossier)
    except Exception as e:
        print(f"Error during automatic compliance check: {e}")

    # Trigger notifications for all administrative users (admins and authorities)
    try:
        admin_users = db.query(User).filter(User.role.in_(["admin", "authority"])).all()
        for admin in admin_users:
            crud_notification.create_notification(
                db=db,
                user_id=admin.id,
                title="New Dossier Submitted",
                message=f"A new dossier '{db_dossier.title}' has been submitted for review by {current_user.full_name or current_user.email}.",
                dossier_id=db_dossier.id
            )
    except Exception as notif_err:
        print(f"Error creating admin notifications: {notif_err}")
        
    return db_dossier

@router.get("", response_model=List[DossierResponse])
def read_dossiers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role in {"admin", "authority"}:
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
    
    update_data = DossierUpdate(ai_analysis=agent_response.get("answer", ""))
    updated_dossier = crud_dossier.update_dossier(db, db_dossier, update_data)
    
    return {"message": "Compliance verified", "dossier": updated_dossier, "agent_sources": agent_response.get("sources", [])}
