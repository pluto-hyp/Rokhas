from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class DossierBase(BaseModel):
    title: str
    description: Optional[str] = None
    type: Optional[str] = None
    hauteur: Optional[float] = None
    recul: Optional[float] = None
    emprise: Optional[float] = None
    surface_terrain: Optional[float] = None
    zone: Optional[str] = None

class DossierCreate(DossierBase):
    pass

class DossierUpdate(DossierBase):
    title: Optional[str] = None
    status: Optional[str] = None
    ai_analysis: Optional[str] = None

class DossierResponse(DossierBase):
    id: int
    status: str
    owner_id: int
    ai_analysis: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
