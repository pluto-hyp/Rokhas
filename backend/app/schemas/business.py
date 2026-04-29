from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class BusinessBase(BaseModel):
    name: str
    type: str
    status: Optional[str] = "Active"

class BusinessCreate(BusinessBase):
    pass

class BusinessUpdate(BusinessBase):
    name: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None

class BusinessResponse(BusinessBase):
    id: int
    registration_date: datetime
    owner_id: int

    class Config:
        from_attributes = True
