from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: Optional[str] = None

class UserResponse(UserBase):
    id: int
    role: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
