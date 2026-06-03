from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_active_user, get_current_admin_user
from app.models.user import User
from app.schemas.business_permit import BusinessPermitCreate, BusinessPermitResponse, BusinessPermitUpdate
from app.crud import business_permit as crud_business_permit
from app.core.config import settings
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

router = APIRouter()

# File management helpers
UPLOAD_DIR = Path(settings.UPLOADS_DIR)


def _safe_file_path(base_dir: Path, filename: str) -> Path:
    file_path = (base_dir / filename).resolve()
    if not file_path.is_relative_to(base_dir.resolve()):
        raise HTTPException(status_code=400, detail="Invalid filename")
    return file_path


def _temporary_document_path(permit, filename: str) -> Path | None:
    """Resolve legacy business permit docs that still point at temporary dossier uploads."""
    for document in permit.permit_documents or []:
        document_url = document.get("url") or ""
        if not document_url:
            continue

        parsed_url = urlparse(document_url)
        stored_filename = unquote(Path(parsed_url.path).name)
        if stored_filename != filename and document.get("filename") != filename:
            continue

        query_user_id = parse_qs(parsed_url.query).get("user_id", [None])[0]
        owner_id = int(query_user_id) if query_user_id and query_user_id.isdigit() else permit.owner_id
        temp_dir = UPLOAD_DIR / "temporary" / f"user_{owner_id}"
        return _safe_file_path(temp_dir, stored_filename or filename)

    return None

@router.post("", response_model=BusinessPermitResponse)
@router.post("/", response_model=BusinessPermitResponse, include_in_schema=False)
def create_business_permit(
    permit: BusinessPermitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new business permit request"""
    return crud_business_permit.create_business_permit(db=db, permit=permit, owner_id=current_user.id)

@router.get("/", response_model=List[BusinessPermitResponse])
def read_business_permits(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get list of business permits (all for authority/admin, only own for citizen)"""
    if current_user.role in {"admin", "authority"}:
        return crud_business_permit.get_business_permits(db, skip=skip, limit=limit)
    return crud_business_permit.get_business_permits_by_owner(db, owner_id=current_user.id, skip=skip, limit=limit)

@router.get("/{permit_id}", response_model=BusinessPermitResponse)
def read_business_permit(
    permit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific business permit"""
    permit = crud_business_permit.get_business_permit(db, permit_id=permit_id)
    if not permit:
        raise HTTPException(status_code=404, detail="Business permit not found")
    
    # Allow access if user is owner, admin, or authority
    if current_user.id != permit.owner_id and current_user.role not in {"admin", "authority"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return permit

@router.patch("/{permit_id}", response_model=BusinessPermitResponse)
def update_business_permit(
    permit_id: int,
    permit_update: BusinessPermitUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update business permit status (documents, approval, etc.)"""
    permit = crud_business_permit.get_business_permit(db, permit_id=permit_id)
    if not permit:
        raise HTTPException(status_code=404, detail="Business permit not found")
    
    # Only admins/authorities can change status to Approved
    if permit_update.status == "Approved" and current_user.role not in {"admin", "authority"}:
        raise HTTPException(status_code=403, detail="Only admins and authorities can approve permits")
    
    # Generate signature if approving
    if permit_update.status == "Approved":
        timestamp = datetime.now(timezone.utc).isoformat()
        signer = permit_update.signed_by or current_user.full_name or "Municipal Authority"
        
        # Create hash payload with business details
        hash_payload = f"BUSINESSPERMIT-{permit_id}|OWNER-{permit.owner_id}|NAME-{permit.business_name}|BY-{signer}|AT-{timestamp}"
        signature_hash = hashlib.sha256(hash_payload.encode()).hexdigest()
        
        permit_update.signature_hash = signature_hash
        permit_update.signed_by = signer
        permit_update.signed_at = datetime.now(timezone.utc)
    
    return crud_business_permit.update_business_permit(db=db, db_permit=permit, permit_update=permit_update)

@router.post("/{permit_id}/upload-document")
def upload_document(
    permit_id: int,
    file: UploadFile = File(...),
    key: str = Query("business_document"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Upload a document for a business permit request"""
    permit = crud_business_permit.get_business_permit(db, permit_id=permit_id)
    if not permit:
        raise HTTPException(status_code=404, detail="Business permit not found")
    
    # Only owner can upload documents
    if current_user.id != permit.owner_id and current_user.role not in {"admin", "authority"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Create directory if it doesn't exist
    permit_dir = UPLOAD_DIR / f"business_permit_{permit_id}"
    permit_dir.mkdir(parents=True, exist_ok=True)
    
    # Save file
    file_path = permit_dir / file.filename
    with open(file_path, "wb") as f:
        f.write(file.file.read())
    
    # Update permit_documents list
    docs = list(permit.permit_documents or [])
    # Remove any existing document with the same key
    docs = [d for d in docs if d.get("key") != key]
    
    # Append new document info
    docs.append({
        "key": key,
        "filename": file.filename,
        "url": f"/api/v1/business-permits/{permit_id}/documents/{file.filename}",
        "approved": True,
        "required": True,
        "notes": []
    })
    permit.permit_documents = docs
    db.add(permit)
    db.commit()
    db.refresh(permit)
    
    # Return file URL
    return {
        "filename": file.filename,
        "url": f"/api/v1/business-permits/{permit_id}/documents/{file.filename}"
    }

@router.get("/{permit_id}/documents/{filename}")
def get_document(
    permit_id: int,
    filename: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Download/preview a document from a business permit"""
    permit = crud_business_permit.get_business_permit(db, permit_id=permit_id)
    if not permit:
        raise HTTPException(status_code=404, detail="Business permit not found")
    
    # Check access
    if current_user.id != permit.owner_id and current_user.role not in {"admin", "authority"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    permit_dir = UPLOAD_DIR / f"business_permit_{permit_id}"
    file_path = _safe_file_path(permit_dir, filename)

    if not file_path.exists():
        fallback_path = _temporary_document_path(permit, filename)
        if fallback_path is not None:
            file_path = fallback_path
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Document not found")
    
    return FileResponse(path=file_path, filename=file_path.name)
