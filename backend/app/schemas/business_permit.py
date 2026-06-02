from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class PermitDocumentSchema(BaseModel):
    key: str
    filename: str
    url: Optional[str] = None
    approved: bool = False
    required: bool = False
    notes: List[str] = []

class BusinessPermitBase(BaseModel):
    business_name: str
    business_type: str
    business_description: Optional[str] = None
    address: str
    zone: Optional[str] = None
    surface_area: Optional[int] = None
    applicant_name: str
    applicant_cin: str

class BusinessPermitCreate(BusinessPermitBase):
    permit_documents: Optional[List[PermitDocumentSchema]] = []

class BusinessPermitUpdate(BaseModel):
    status: Optional[str] = None
    permit_documents: Optional[List[PermitDocumentSchema]] = None
    signed_by: Optional[str] = None
    signature_hash: Optional[str] = None
    signed_at: Optional[datetime] = None

class BusinessPermitResponse(BusinessPermitBase):
    id: int
    owner_id: int
    status: str
    created_at: datetime
    permit_documents: List[PermitDocumentSchema] = []
    signed_by: Optional[str] = None
    signature_hash: Optional[str] = None
    signed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
