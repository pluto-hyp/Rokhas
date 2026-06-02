from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Business(Base):
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)
    status = Column(String, default="Pending")
    registration_date = Column(DateTime, default=datetime.utcnow)
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    # Signature fields for official approval
    signed_by = Column(String, nullable=True)
    signature_hash = Column(String, nullable=True)
    signed_at = Column(DateTime(timezone=True), nullable=True)

    owner = relationship("User", back_populates="businesses")
