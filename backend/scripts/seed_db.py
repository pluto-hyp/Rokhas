import sys
import os
import random
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.dossier import Dossier
from app.models.business import Business
from app.models.evaluation import Evaluation
from app.core.security import get_password_hash

def seed():
    db = SessionLocal()
    try:
        Base.metadata.create_all(bind=engine)

        admin = db.query(User).filter(User.email == "admin@rokhas.ma").first()
        if not admin:
            admin = User(
                email="admin@rokhas.ma",
                hashed_password=get_password_hash("admin123"),
                full_name="System Administrator",
                role="authority"
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)

        citizens = []
        names = [
            "Youssef Bennani", "Fatima Zahra Idrissi", "Karim El Fassi", 
            "Amine Mansouri", "Sanaa Alami", "Mehdi Tazi", "Laila Chraibi",
            "Omar Gaddari", "Salma Filali", "Anas Zaki"
        ]
        for name in names:
            email = f"{name.lower().replace(' ', '.')}@example.com"
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    email=email, 
                    hashed_password=get_password_hash("password"), 
                    full_name=name, 
                    role="citizen"
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            citizens.append(user)

        dossier_types = ["Construction", "Renovation", "Demolition", "Extension"]
        zones = ["Industrial", "Commercial", "Residential", "Agricultural"]
        statuses = ["Approved", "Pending", "In Review", "Rejected"]
        
        titles = [
            "Villa Extension Marrakech", "Apartment Renovation Casablanca", 
            "Industrial Warehouse Phase 1", "Downtown Commercial Space",
            "Residential Complex Rabat", "Sustainable Office Building",
            "Heritage Site Restoration", "Smart City Hub Extension",
            "Mixed-use Development Project", "Coastal Resort Renovation"
        ]

        if db.query(Dossier).count() < 15:
            for i in range(20):
                owner = random.choice(citizens)
                dossier = Dossier(
                    title=random.choice(titles) + f" #{i+1}",
                    type=random.choice(dossier_types),
                    status=random.choice(statuses),
                    owner_id=owner.id,
                    zone=random.choice(zones),
                    hauteur=random.uniform(3.0, 25.0),
                    recul=random.uniform(2.0, 10.0),
                    emprise=random.uniform(0.2, 0.8),
                    surface_terrain=random.uniform(100.0, 5000.0),
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 100))
                )
                db.add(dossier)
            db.commit()

        business_types = ["Technology", "Hospitality", "Logistics", "Retail", "Finance"]
        business_names = [
            "Atlas Tech Solutions", "Marrakech Fine Dining", "Casablanca Logistics",
            "Rabat Financial Hub", "Tanger Port Services", "Agadir Tourism Group",
            "Fes Artisanal Exports", "Oujda Energy Systems", "Kenitra Auto Parts"
        ]

        if db.query(Business).count() < 5:
            for name in business_names:
                owner = random.choice(citizens)
                biz = Business(
                    name=name,
                    type=random.choice(business_types),
                    status="Active" if random.random() > 0.1 else "Suspended",
                    owner_id=owner.id,
                    registration_date=datetime.utcnow() - timedelta(days=random.randint(30, 365))
                )
                db.add(biz)
            db.commit()

        if db.query(Evaluation).count() < 5:
            dossiers = db.query(Dossier).limit(10).all()
            for d in dossiers:
                eval_obj = Evaluation(
                    project_ref=f"RKH-2026-{d.id:04d}",
                    score=random.uniform(3.0, 5.0),
                    comments=random.choice([
                        "Excellent compliance with zone regulations.",
                        "Minor adjustments needed for height restrictions.",
                        "Structure integrity verified by external board.",
                        "Environmental impact study approved.",
                        "Documentation complete and well-organized."
                    ]),
                    evaluator_id=admin.id,
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 10))
                )
                db.add(eval_obj)
            db.commit()

        print("Database seeded successfully with a high volume of realistic data!")
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
