from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_active_user, get_current_admin_user
from app.models.user import User
from app.schemas.user import UserResponse
from app.crud import user as crud_user

router = APIRouter()

from pydantic import BaseModel

class RoleUpdate(BaseModel):
    role: str

@router.get("/me", response_model=UserResponse)
def read_user_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.patch("/me/role", response_model=UserResponse)
def update_user_role(
    role_update: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    valid_roles = ["citizen", "architect", "authority"]
    if role_update.role not in valid_roles:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Invalid role")
    
    current_user.role = role_update.role
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/", response_model=List[UserResponse])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    users = crud_user.get_users(db, skip=skip, limit=limit)
    return users
