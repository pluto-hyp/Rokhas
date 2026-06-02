from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class BusinessBase(BaseModel):
    name: str
    type: str
    status: Optional[str] = "Pending"

class BusinessCreate(BusinessBase):
    pass

class BusinessUpdate(BusinessBase):
    name: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    signed_by: Optional[str] = None
    signature_hash: Optional[str] = None
    signed_at: Optional[datetime] = None

class BusinessResponse(BusinessBase):
    id: int
    registration_date: datetime
    owner_id: int
    signed_by: Optional[str] = None
    signature_hash: Optional[str] = None
    signed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
