from sqlalchemy.orm import Session
from app.models.business import Business
from app.schemas.business import BusinessCreate, BusinessUpdate

def get_business(db: Session, business_id: int):
    return db.query(Business).filter(Business.id == business_id).first()

def get_businesses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Business).offset(skip).limit(limit).all()

def get_businesses_by_owner(db: Session, owner_id: int, skip: int = 0, limit: int = 100):
    return db.query(Business).filter(Business.owner_id == owner_id).offset(skip).limit(limit).all()

def create_business(db: Session, business: BusinessCreate, owner_id: int):
    db_business = Business(**business.model_dump(), owner_id=owner_id)
    db.add(db_business)
    db.commit()
    db.refresh(db_business)
    return db_business

def update_business(db: Session, db_business: Business, business_update: BusinessUpdate):
    update_data = business_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_business, key, value)
    db.add(db_business)
    db.commit()
    db.refresh(db_business)
    return db_business
