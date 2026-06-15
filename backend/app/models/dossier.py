from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Dossier(Base):
    __tablename__ = "dossiers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text)
    
    status = Column(String, default="Pending", nullable=False)
    
    type = Column(String)
    hauteur = Column(Float)
    recul = Column(Float)
    emprise = Column(Float)
    surface_terrain = Column(Float)
    zone = Column(String)

    owner_name = Column(String)
    owner_cin = Column(String)
    land_reference = Column(String)
    municipal_fee_amount = Column(Float)
    municipal_fee_receipt = Column(String)
    municipal_fee_paid = Column(Boolean, default=False, nullable=False)
    permit_documents = Column(JSON, default=list, nullable=False)
    
    ai_analysis = Column(Text, nullable=True)
    
    signed_by = Column(String, nullable=True)
    signature_hash = Column(String, nullable=True)
    signed_at = Column(DateTime(timezone=True), nullable=True)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="dossiers")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
