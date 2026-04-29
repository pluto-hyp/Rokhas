import sys
import os
from sqlalchemy.orm import Session
from datetime import datetime

# Add the project root to sys.path
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
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)

        # Check if admin already exists
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

        # Add some citizens
        citizen_data = [
            ("youssef@example.com", "Youssef Bennani"),
            ("fatima@example.com", "Fatima Zahra Idrissi"),
            ("karim@example.com", "Karim El Fassi")
        ]
        for email, name in citizen_data:
            if not db.query(User).filter(User.email == email).first():
                u = User(email=email, hashed_password=get_password_hash("password"), full_name=name, role="citizen")
                db.add(u)
        db.commit()

        # Add some dossiers
        if db.query(Dossier).count() == 0:
            dossiers = [
                Dossier(title="Commercial Construction", type="Construction", status="Pending", owner_id=admin.id, zone="Industrial", hauteur=12.5, recul=5.0),
                Dossier(title="Restaurant License", type="Business", status="Approved", owner_id=admin.id, zone="Commercial", hauteur=4.0, recul=2.0),
                Dossier(title="Residential Renovation", type="Construction", status="In Review", owner_id=admin.id, zone="Residential", hauteur=8.5, recul=3.0)
            ]
            db.add_all(dossiers)
            db.commit()

        # Add some businesses
        if db.query(Business).count() == 0:
            businesses = [
                Business(name="Atlas Tech Solutions", type="Technology", status="Active", owner_id=admin.id),
                Business(name="Marrakech Fine Dining", type="Hospitality", status="Active", owner_id=admin.id),
                Business(name="Casablanca Logistics", type="Transport", status="Active", owner_id=admin.id)
            ]
            db.add_all(businesses)
            db.commit()

        # Add some evaluations
        if db.query(Evaluation).count() == 0:
            evaluations = [
                Evaluation(project_ref="RKH-2026-0841", score=4.5, comments="Excellent compliance with zone regulations.", evaluator_id=admin.id),
                Evaluation(project_ref="RKH-2026-0839", score=3.8, comments="Minor adjustments needed for height restrictions.", evaluator_id=admin.id)
            ]
            db.add_all(evaluations)
            db.commit()

        print("Database seeded successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
