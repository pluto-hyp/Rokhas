from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_admin_user
from app.models.user import User
from app.schemas.user import UserResponse as UserSchema

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
def read_citizens(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Returns a list of all users with role 'citizen'.
    Accessible only by admins/authority.
    """
    return db.query(User).filter(User.role == "citizen").offset(skip).limit(limit).all()
