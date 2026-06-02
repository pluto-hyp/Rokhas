from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_active_user, get_current_admin_user
from app.models.user import User
from app.schemas.business import BusinessCreate, BusinessResponse, BusinessUpdate
from app.crud import business as crud_business
import hashlib
from datetime import datetime, timezone

router = APIRouter()

@router.post("/", response_model=BusinessResponse)
def create_business(
    business: BusinessCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return crud_business.create_business(db=db, business=business, owner_id=current_user.id)

@router.get("/", response_model=List[BusinessResponse])
def read_businesses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role in {"admin", "authority"}:
        return crud_business.get_businesses(db, skip=skip, limit=limit)
    return crud_business.get_businesses_by_owner(db, owner_id=current_user.id, skip=skip, limit=limit)

@router.get("/{business_id}", response_model=BusinessResponse)
def read_business(
    business_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    business = crud_business.get_business(db, business_id=business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    # Allow access if user is owner, admin, or authority
    if current_user.id != business.owner_id and current_user.role not in {"admin", "authority"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return business

@router.patch("/{business_id}", response_model=BusinessResponse)
def update_business(
    business_id: int,
    business_update: BusinessUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    business = crud_business.get_business(db, business_id=business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    # Only admins and authorities can approve businesses
    if business_update.status == "Approved" and current_user.role not in {"admin", "authority"}:
        raise HTTPException(status_code=403, detail="Only admins and authorities can approve businesses")
    
    # Generate signature if approving
    if business_update.status == "Approved":
        timestamp = datetime.now(timezone.utc).isoformat()
        signer = business_update.signed_by or current_user.name or "Municipal Authority"
        
        # Create hash payload with business details
        hash_payload = f"BUSINESS-{business_id}|OWNER-{business.owner_id}|NAME-{business.name}|BY-{signer}|AT-{timestamp}"
        signature_hash = hashlib.sha256(hash_payload.encode()).hexdigest()
        
        business_update.signature_hash = signature_hash
        business_update.signed_by = signer
        business_update.signed_at = datetime.now(timezone.utc)
    
    return crud_business.update_business(db=db, db_business=business, business_update=business_update)
