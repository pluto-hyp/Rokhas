from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class PermitDocument(BaseModel):
    key: str
    label: str
    filename: str
    url: Optional[str] = None
    size: Optional[str] = None
    approved: bool = False
    required: bool = True
    notes: List[str] = Field(default_factory=list)

class DossierBase(BaseModel):
    title: str
    description: Optional[str] = None
    type: Optional[str] = None
    hauteur: Optional[float] = None
    recul: Optional[float] = None
    emprise: Optional[float] = None
    surface_terrain: Optional[float] = None
    zone: Optional[str] = None
    owner_name: Optional[str] = None
    owner_cin: Optional[str] = None
    land_reference: Optional[str] = None
    municipal_fee_amount: Optional[float] = None
    municipal_fee_receipt: Optional[str] = None
    municipal_fee_paid: bool = False
    permit_documents: List[PermitDocument] = Field(default_factory=list)

class DossierCreate(DossierBase):
    pass

class DossierUpdate(DossierBase):
    title: Optional[str] = None
    status: Optional[str] = None
    ai_analysis: Optional[str] = None
    signed_by: Optional[str] = None
    signature_hash: Optional[str] = None
    signed_at: Optional[datetime] = None

class DossierResponse(DossierBase):
    id: int
    status: str
    owner_id: int
    ai_analysis: Optional[str] = None
    signed_by: Optional[str] = None
    signature_hash: Optional[str] = None
    signed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
