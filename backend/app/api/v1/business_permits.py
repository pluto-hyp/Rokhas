from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_active_user, get_current_admin_user
from app.models.user import User
from app.schemas.business_permit import BusinessPermitCreate, BusinessPermitResponse, BusinessPermitUpdate
from app.crud import business_permit as crud_business_permit
from app.crud import notification as crud_notification
from app.services.agent_client import verify_business_permit_with_agent
from app.services import blob_storage
from app.core.config import settings
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

router = APIRouter()

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
async def create_business_permit(
    permit: BusinessPermitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new business permit request"""
    new_permit = crud_business_permit.create_business_permit(db=db, permit=permit, owner_id=current_user.id)
    
    permit_dir = UPLOAD_DIR / f"business_permit_{new_permit.id}"
    permit_dir.mkdir(parents=True, exist_ok=True)
    
    updated_docs = []
    import shutil
    for doc in permit.permit_documents or []:
        doc_dict = doc.model_dump()
        if doc.url:
            # If URL is already a blob URL, keep it as-is (no local copy needed)
            if blob_storage.is_blob_url(doc.url):
                updated_docs.append(doc_dict)
                continue

            # Legacy: try to move from temporary local storage
            parsed_url = urlparse(doc.url)
            temp_filename = unquote(Path(parsed_url.path).name)
            query_user_id = parse_qs(parsed_url.query).get("user_id", [None])[0]
            owner_id = int(query_user_id) if query_user_id and query_user_id.isdigit() else current_user.id
            temp_file_path = UPLOAD_DIR / "temporary" / f"user_{owner_id}" / temp_filename
            
            if temp_file_path.exists():
                permit_dir = UPLOAD_DIR / f"business_permit_{new_permit.id}"
                permit_dir.mkdir(parents=True, exist_ok=True)
                permanent_file_path = permit_dir / temp_filename
                shutil.copy2(temp_file_path, permanent_file_path)
                doc_dict["url"] = f"/api/v1/business-permits/{new_permit.id}/documents/{temp_filename}"
        updated_docs.append(doc_dict)
        
    new_permit.permit_documents = updated_docs
    db.commit()
    db.refresh(new_permit)
    
    permit_data = {
        "business_name": new_permit.business_name,
        "business_type": new_permit.business_type,
        "business_description": new_permit.business_description or "",
        "address": new_permit.address,
        "zone": new_permit.zone or "",
        "surface_area": new_permit.surface_area,
        "permit_documents": new_permit.permit_documents
    }
    
    try:
        agent_response = await verify_business_permit_with_agent(permit_data)
        new_permit.ai_analysis = agent_response.get("answer", "")
        db.commit()
        db.refresh(new_permit)
    except Exception as e:
        print(f"Error during automatic business permit compliance check: {e}")

    admin_users = db.query(User).filter(User.role.in_(["admin", "authority"])).all()
    for admin in admin_users:
        crud_notification.create_notification(
            db=db,
            user_id=admin.id,
            title="New Business Permit Request",
            message=f"A new business permit request for '{new_permit.business_name}' has been submitted by {current_user.full_name or 'A citizen'}.",
            business_permit_id=new_permit.id
        )
    
    return new_permit

@router.get("", response_model=List[BusinessPermitResponse])
@router.get("/", response_model=List[BusinessPermitResponse], include_in_schema=False)
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
    
    if permit_update.status == "Approved" and current_user.role not in {"admin", "authority"}:
        raise HTTPException(status_code=403, detail="Only admins and authorities can approve permits")
    
    if permit_update.status == "Rejected" and current_user.role not in {"admin", "authority"}:
        raise HTTPException(status_code=403, detail="Only admins and authorities can reject permits")
    
    if permit_update.status == "Approved":
        timestamp = datetime.now(timezone.utc).isoformat()
        signer = permit_update.signed_by or current_user.full_name or "Municipal Authority"
        
        hash_payload = f"BUSINESSPERMIT-{permit_id}|OWNER-{permit.owner_id}|NAME-{permit.business_name}|BY-{signer}|AT-{timestamp}"
        signature_hash = hashlib.sha256(hash_payload.encode()).hexdigest()
        
        permit_update.signature_hash = signature_hash
        permit_update.signed_by = signer
        permit_update.signed_at = datetime.now(timezone.utc)
    
    return crud_business_permit.update_business_permit(db=db, db_permit=permit, permit_update=permit_update)

@router.post("/{permit_id}/upload-document")
async def upload_document(
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
    
    if current_user.id != permit.owner_id and current_user.role not in {"admin", "authority"}:
        raise HTTPException(status_code=403, detail="Not authorized")

    filename = file.filename or "document"
    filename = "".join(c for c in filename if c.isalnum() or c in "._- ").rstrip() or "document"
    content = await file.file.read()

    # --- Vercel Blob Storage ---
    if blob_storage.is_blob_enabled():
        blob_path = f"business_permits/{permit_id}/{filename}"
        result = await blob_storage.upload_to_blob(
            content, 
            blob_path, 
            content_type=file.content_type
        )
        file_url = result["url"]
    else:
        # --- Local disk fallback ---
        permit_dir = UPLOAD_DIR / f"business_permit_{permit_id}"
        permit_dir.mkdir(parents=True, exist_ok=True)
        file_path = permit_dir / filename
        with open(file_path, "wb") as f:
            f.write(content)
        file_url = f"/api/v1/business-permits/{permit_id}/documents/{filename}"
    
    docs = list(permit.permit_documents or [])
    docs = [d for d in docs if d.get("key") != key]
    
    docs.append({
        "key": key,
        "filename": filename,
        "url": file_url,
        "approved": True,
        "required": True,
        "notes": []
    })
    permit.permit_documents = docs
    db.add(permit)
    db.commit()
    db.refresh(permit)
    
    return {
        "filename": filename,
        "url": file_url,
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
    
    if current_user.id != permit.owner_id and current_user.role not in {"admin", "authority"}:
        raise HTTPException(status_code=403, detail="Not authorized")

    # If matching document is on Vercel Blob, redirect directly
    for doc in (permit.permit_documents or []):
        doc_filename = doc.get("filename", "")
        doc_url = doc.get("url", "")
        if doc_filename == filename and blob_storage.is_blob_url(doc_url):
            return RedirectResponse(url=doc_url, status_code=302)

    permit_dir = UPLOAD_DIR / f"business_permit_{permit_id}"
    file_path = _safe_file_path(permit_dir, filename)

    if not file_path.exists():
        fallback_path = _temporary_document_path(permit, filename)
        if fallback_path is not None:
            file_path = fallback_path
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Document not found")
    
    return FileResponse(path=file_path, filename=file_path.name)
