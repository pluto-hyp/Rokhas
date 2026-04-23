from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Dossier(Base):
    __tablename__ = "dossiers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text)
    
    # "Pending", "In Review", "Approved", "Rejected"
    status = Column(String, default="Pending", nullable=False)
    
    # Project properties (like in the RGC agent)
    type = Column(String)
    hauteur = Column(Float)
    recul = Column(Float)
    emprise = Column(Float)
    surface_terrain = Column(Float)
    zone = Column(String)
    
    # AI verification notes
    ai_analysis = Column(Text, nullable=True)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
