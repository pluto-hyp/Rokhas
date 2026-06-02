from sqlalchemy.orm import Session
from app.models.business_permit import BusinessPermit
from app.schemas.business_permit import BusinessPermitCreate, BusinessPermitUpdate

def get_business_permit(db: Session, permit_id: int):
    return db.query(BusinessPermit).filter(BusinessPermit.id == permit_id).first()

def get_business_permits(db: Session, skip: int = 0, limit: int = 100):
    return db.query(BusinessPermit).offset(skip).limit(limit).all()

def get_business_permits_by_owner(db: Session, owner_id: int, skip: int = 0, limit: int = 100):
    return db.query(BusinessPermit).filter(BusinessPermit.owner_id == owner_id).offset(skip).limit(limit).all()

def create_business_permit(db: Session, permit: BusinessPermitCreate, owner_id: int):
    db_permit = BusinessPermit(**permit.model_dump(), owner_id=owner_id)
    db.add(db_permit)
    db.commit()
    db.refresh(db_permit)
    return db_permit

def update_business_permit(db: Session, db_permit: BusinessPermit, permit_update: BusinessPermitUpdate):
    update_data = permit_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_permit, key, value)
    db.add(db_permit)
    db.commit()
    db.refresh(db_permit)
    return db_permit

def delete_business_permit(db: Session, permit_id: int):
    db_permit = db.query(BusinessPermit).filter(BusinessPermit.id == permit_id).first()
    if db_permit:
        db.delete(db_permit)
        db.commit()
    return db_permit
