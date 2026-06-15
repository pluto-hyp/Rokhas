from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class BusinessPermit(Base):
    __tablename__ = "business_permits"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    business_name = Column(String, index=True)
    business_type = Column(String)  # e.g., "Restaurant", "Shop", "Salon"
    business_description = Column(String)
    address = Column(String)
    zone = Column(String)
    surface_area = Column(Integer, nullable=True)  # in m²
    
    applicant_name = Column(String)
    applicant_cin = Column(String)
    
    status = Column(String, default="Pending")  # Pending, Under Review, Approved, Rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    
    permit_documents = Column(JSON, default=[])
    
    ai_analysis = Column(String, nullable=True)
    
    signed_by = Column(String, nullable=True)
    signature_hash = Column(String, nullable=True)
    signed_at = Column(DateTime(timezone=True), nullable=True)
    
    owner = relationship("User", back_populates="business_permits")
