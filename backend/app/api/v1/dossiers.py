from typing import List
import os
import shutil
import hashlib
import mimetypes
from pathlib import Path
from datetime import datetime, timezone
from urllib.parse import parse_qs, unquote, urlparse
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse, RedirectResponse
from app.services import blob_storage
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
    if current_user.role not in {"admin", "authority"} and db_dossier.owner_id != current_user.id:
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
    
    if status_update.status == "Approved":
        # Validate all required permit documents are approved
        permit_documents = db_dossier.permit_documents or []
        required_docs = [doc for doc in permit_documents if doc.get("required", True)]
        unapproved_required = [doc for doc in required_docs if not doc.get("approved", False)]
        
        if unapproved_required:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot approve dossier: {len(unapproved_required)} required document(s) not approved"
            )
        
        timestamp_utc = datetime.now(timezone.utc).isoformat()
        signer_name = current_user.full_name or current_user.email
        
        hash_payload = (
            f"DOSSIER-{db_dossier.id}|"
            f"OWNER-{db_dossier.owner_cin}|"
            f"LAND-{db_dossier.land_reference}|"
            f"BY-{signer_name}|"
            f"AT-{timestamp_utc}"
        )
        
        signature_hash = hashlib.sha256(hash_payload.encode()).hexdigest()
        
        update_data = status_update.model_dump(exclude_unset=True)
        update_data["signed_by"] = signer_name
        update_data["signature_hash"] = signature_hash
        update_data["signed_at"] = datetime.now(timezone.utc)
        status_update = DossierUpdate(**update_data)
    
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
    db_dossier = crud_dossier.get_dossier(db, dossier_id=dossier_id)
    if db_dossier is None:
        raise HTTPException(status_code=404, detail="Dossier not found")
    
    if current_user.role not in {"admin", "authority"} and db_dossier.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to upload documents to this dossier")
    
    if file.size and file.size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="File too large")
    
    try:
        filename = file.filename or "document"
        filename = "".join(c for c in filename if c.isalnum() or c in "._- ").rstrip()
        if not filename:
            filename = "document"
        
        content = await file.read()

        # --- Vercel Blob Storage (preferred in production) ---
        if blob_storage.is_blob_enabled():
            blob_path = f"dossiers/{dossier_id}/{filename}"
            result = await blob_storage.upload_to_blob(content, blob_path)
            return {
                "filename": filename,
                "url": result["url"],
                "size": result["size"],
            }

        # --- Local disk fallback (development / non-Vercel) ---
        dossier_dir = Path(settings.UPLOADS_DIR) / f"dossier_{dossier_id}"
        dossier_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = dossier_dir / filename
        
        if file_path.exists():
            name, ext = filename.rsplit(".", 1) if "." in filename else (filename, "")
            counter = 1
            while file_path.exists():
                new_name = f"{name}_{counter}.{ext}" if ext else f"{name}_{counter}"
                file_path = dossier_dir / new_name
                counter += 1
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        file_url = f"/api/v1/dossiers/{dossier_id}/documents/{file_path.name}"
        return {
            "filename": file_path.name,
            "url": file_url,
            "size": len(content)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

def _safe_file_path(base_dir: Path, filename: str) -> Path:
    file_path = (base_dir / filename).resolve()
    if not file_path.is_relative_to(base_dir.resolve()):
        raise HTTPException(status_code=400, detail="Invalid filename")
    return file_path


def _temporary_document_path(dossier, filename: str) -> Path | None:
    """Resolve dossier docs that still point at temporary uploads."""
    for document in dossier.permit_documents or []:
        document_url = document.get("url") or ""
        if not document_url:
            continue

        parsed_url = urlparse(document_url)
        stored_filename = unquote(Path(parsed_url.path).name)
        if stored_filename != filename and document.get("filename") != filename:
            continue

        query_user_id = parse_qs(parsed_url.query).get("user_id", [None])[0]
        owner_id = int(query_user_id) if query_user_id and query_user_id.isdigit() else dossier.owner_id
        temp_dir = Path(settings.UPLOADS_DIR) / "temporary" / f"user_{owner_id}"
        return _safe_file_path(temp_dir, stored_filename or filename)

    return None


@router.post("/{dossier_id}/documents/{filename}")
@router.get("/{dossier_id}/documents/{filename}")
async def download_document(
    dossier_id: int,
    filename: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Download or preview a document from a dossier.
    Accessible by dossier owner, admins, and authorities.
    If the file is stored on Vercel Blob, redirects to the public blob URL.
    """
    db_dossier = crud_dossier.get_dossier(db, dossier_id=dossier_id)
    if db_dossier is None:
        raise HTTPException(status_code=404, detail="Dossier not found")
    
    if current_user.role not in {"admin", "authority"} and db_dossier.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this document")

    # Check if any matching document URL points to Vercel Blob — redirect directly
    for doc in (db_dossier.permit_documents or []):
        doc_filename = doc.get("filename", "")
        doc_url = doc.get("url", "")
        if doc_filename == filename and blob_storage.is_blob_url(doc_url):
            return RedirectResponse(url=doc_url, status_code=302)

    if ".." in filename or filename.startswith("/") or filename.startswith("\\"):
        raise HTTPException(status_code=403, detail="Invalid file path")
    
    dossier_dir = Path(settings.UPLOADS_DIR) / f"dossier_{dossier_id}"
    file_path = dossier_dir / filename
    
    if not file_path.exists():
        # Try fallback: docs that were submitted before dossier creation (temporary uploads)
        fallback_path = _temporary_document_path(db_dossier, filename)
        if fallback_path is not None and fallback_path.exists():
            file_path = fallback_path
            
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Document not found")
    
    content_type, _ = mimetypes.guess_type(file_path.name)
    if not content_type:
        content_type = "application/octet-stream"
        
    return FileResponse(
        path=file_path,
        filename=file_path.name,
        media_type=content_type
    )

@router.post("/upload-temporary-document")
async def upload_temporary_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload a document file temporarily before dossier creation.
    Used for file uploads during form creation.
    When Vercel Blob is configured, files are uploaded directly to the blob store
    and the returned URL is a permanent public blob URL.
    """
    if file.size and file.size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="File too large")
    
    try:
        filename = file.filename or "document"
        filename = "".join(c for c in filename if c.isalnum() or c in "._- ").rstrip()
        if not filename:
            filename = "document"

        content = await file.read()

        # --- Vercel Blob Storage (preferred in production) ---
        if blob_storage.is_blob_enabled():
            blob_path = f"temporary/user_{current_user.id}/{filename}"
            result = await blob_storage.upload_to_blob(content, blob_path)
            return {
                "filename": filename,
                "url": result["url"],
                "size": result["size"],
            }

        # --- Local disk fallback (development / non-Vercel) ---
        temp_dir = Path(settings.UPLOADS_DIR) / "temporary" / f"user_{current_user.id}"
        temp_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = temp_dir / filename
        
        if file_path.exists():
            name, ext = filename.rsplit(".", 1) if "." in filename else (filename, "")
            counter = 1
            while file_path.exists():
                new_name = f"{name}_{counter}.{ext}" if ext else f"{name}_{counter}"
                file_path = temp_dir / new_name
                counter += 1
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        file_url = f"/api/v1/dossiers/temporary-documents/{file_path.name}?user_id={current_user.id}"
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
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this document")
    
    temp_dir = Path(settings.UPLOADS_DIR) / "temporary" / f"user_{user_id}"
    file_path = temp_dir / filename
    
    try:
        file_path = file_path.resolve()
        temp_dir = temp_dir.resolve()
        if not str(file_path).startswith(str(temp_dir)):
            raise HTTPException(status_code=403, detail="Invalid file path")
    except Exception as e:
        raise HTTPException(status_code=403, detail="Invalid file path")
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Document not found")
    
    content_type, _ = mimetypes.guess_type(file_path.name)
    if not content_type:
        content_type = "application/octet-stream"
        
    return FileResponse(
        path=file_path,
        filename=file_path.name,
        media_type=content_type
    )
