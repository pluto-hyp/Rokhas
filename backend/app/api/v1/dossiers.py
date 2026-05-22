from typing import List
import os
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_active_user, get_current_admin_user
from app.models.user import User
from app.schemas.dossier import DossierCreate, DossierResponse, DossierUpdate
from app.crud import dossier as crud_dossier
from app.crud import notification as crud_notification
from app.services.agent_client import verify_dossier_with_agent
from app.core.config import settings

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

@router.post("/{dossier_id}/upload-document")
async def upload_document(
    dossier_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload a document file for a specific dossier.
    Returns the file URL to be stored in document metadata.
    """
    # Verify dossier ownership/access
    db_dossier = crud_dossier.get_dossier(db, dossier_id=dossier_id)
    if db_dossier is None:
        raise HTTPException(status_code=404, detail="Dossier not found")
    
    if current_user.role not in {"admin", "authority"} and db_dossier.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to upload documents to this dossier")
    
    # Validate file size
    if file.size and file.size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="File too large")
    
    try:
        # Create dossier-specific directory
        dossier_dir = Path(settings.UPLOADS_DIR) / f"dossier_{dossier_id}"
        dossier_dir.mkdir(parents=True, exist_ok=True)
        
        # Sanitize filename
        filename = file.filename or "document"
        # Remove potentially dangerous characters
        filename = "".join(c for c in filename if c.isalnum() or c in "._- ").rstrip()
        if not filename:
            filename = "document"
        
        # Save file
        file_path = dossier_dir / filename
        
        # If file exists, append counter
        if file_path.exists():
            name, ext = filename.rsplit(".", 1) if "." in filename else (filename, "")
            counter = 1
            while file_path.exists():
                new_name = f"{name}_{counter}.{ext}" if ext else f"{name}_{counter}"
                file_path = dossier_dir / new_name
                counter += 1
        
        # Write file
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Generate URL for the document
        file_url = f"/api/v1/dossiers/{dossier_id}/documents/{file_path.name}"
        
        return {
            "filename": file_path.name,
            "url": file_url,
            "size": len(content)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

@router.post("/{dossier_id}/documents/{filename}")
async def download_document(
    dossier_id: int,
    filename: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Download or preview a document from a dossier.
    Accessible by dossier owner, admins, and authorities.
    """
    # Verify dossier exists and user has access
    db_dossier = crud_dossier.get_dossier(db, dossier_id=dossier_id)
    if db_dossier is None:
        raise HTTPException(status_code=404, detail="Dossier not found")
    
    if current_user.role not in {"admin", "authority"} and db_dossier.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this document")
    
    # Construct safe file path
    dossier_dir = Path(settings.UPLOADS_DIR) / f"dossier_{dossier_id}"
    file_path = dossier_dir / filename
    
    # Security: verify file is within dossier directory
    try:
        file_path = file_path.resolve()
        dossier_dir = dossier_dir.resolve()
        if not str(file_path).startswith(str(dossier_dir)):
            raise HTTPException(status_code=403, detail="Invalid file path")
    except Exception as e:
        raise HTTPException(status_code=403, detail="Invalid file path")
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Document not found")
    
    return FileResponse(
        path=file_path,
        filename=file_path.name,
        media_type="application/octet-stream"
    )

@router.post("/upload-temporary-document")
async def upload_temporary_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload a document file temporarily before dossier creation.
    Used for file uploads during form creation.
    Returns the file URL to be stored in document metadata.
    """
    # Validate file size
    if file.size and file.size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="File too large")
    
    try:
        # Create temporary directory for user
        temp_dir = Path(settings.UPLOADS_DIR) / "temporary" / f"user_{current_user.id}"
        temp_dir.mkdir(parents=True, exist_ok=True)
        
        # Sanitize filename
        filename = file.filename or "document"
        # Remove potentially dangerous characters
        filename = "".join(c for c in filename if c.isalnum() or c in "._- ").rstrip()
        if not filename:
            filename = "document"
        
        # Save file
        file_path = temp_dir / filename
        
        # If file exists, append counter
        if file_path.exists():
            name, ext = filename.rsplit(".", 1) if "." in filename else (filename, "")
            counter = 1
            while file_path.exists():
                new_name = f"{name}_{counter}.{ext}" if ext else f"{name}_{counter}"
                file_path = temp_dir / new_name
                counter += 1
        
        # Write file
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Generate URL for the document
        file_url = f"/api/v1/temporary-documents/{file_path.name}?user_id={current_user.id}"
        
        return {
            "filename": file_path.name,
            "url": file_url,
            "size": len(content)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

@router.get("/temporary-documents/{filename}")
async def download_temporary_document(
    filename: str,
    user_id: int,
    current_user: User = Depends(get_current_active_user)
):
    """
    Download or preview a temporarily uploaded document.
    """
    # Security: only allow users to access their own temporary files
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this document")
    
    # Construct safe file path
    temp_dir = Path(settings.UPLOADS_DIR) / "temporary" / f"user_{user_id}"
    file_path = temp_dir / filename
    
    # Security: verify file is within temp directory
    try:
        file_path = file_path.resolve()
        temp_dir = temp_dir.resolve()
        if not str(file_path).startswith(str(temp_dir)):
            raise HTTPException(status_code=403, detail="Invalid file path")
    except Exception as e:
        raise HTTPException(status_code=403, detail="Invalid file path")
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Document not found")
    
    return FileResponse(
        path=file_path,
        filename=file_path.name,
        media_type="application/octet-stream"
    )
