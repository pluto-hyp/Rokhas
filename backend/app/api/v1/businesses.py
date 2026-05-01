from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_active_user, get_current_admin_user
from app.models.user import User
from app.schemas.business import BusinessCreate, BusinessResponse, BusinessUpdate
from app.crud import business as crud_business

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
