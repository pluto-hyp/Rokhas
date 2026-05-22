from sqlalchemy.orm import Session
from app.models.dossier import Dossier
from app.schemas.dossier import DossierCreate, DossierUpdate

def get_dossier(db: Session, dossier_id: int):
    return db.query(Dossier).filter(Dossier.id == dossier_id).first()

def get_dossiers_by_owner(db: Session, owner_id: int, skip: int = 0, limit: int = 100):
    return db.query(Dossier).filter(Dossier.owner_id == owner_id).order_by(Dossier.created_at.desc()).offset(skip).limit(limit).all()

def get_all_dossiers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Dossier).order_by(Dossier.created_at.desc()).offset(skip).limit(limit).all()

def create_dossier(db: Session, dossier: DossierCreate, owner_id: int):
    db_dossier = Dossier(**dossier.model_dump(), owner_id=owner_id)
    db.add(db_dossier)
    db.commit()
    db.refresh(db_dossier)
    return db_dossier

def update_dossier(db: Session, db_dossier: Dossier, dossier_update: DossierUpdate):
    update_data = dossier_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_dossier, key, value)
    db.add(db_dossier)
    db.commit()
    db.refresh(db_dossier)
    return db_dossier
