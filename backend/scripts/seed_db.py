import os
import random
import sys
from datetime import datetime, timedelta, timezone

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import Base, SessionLocal, engine
from app.core.security import get_password_hash
from app.models.business import Business
from app.models.dossier import Dossier
from app.models.evaluation import Evaluation
from app.models.user import User


SEED = 20260501
PASSWORD = "password"


def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def get_or_create_user(db, *, email, full_name, role, password=PASSWORD):
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.full_name = full_name
        user.role = role
        user.is_active = True
        return user

    user = User(
        email=email,
        hashed_password=get_password_hash(password),
        full_name=full_name,
        role=role,
        is_active=True,
    )
    db.add(user)
    db.flush()
    return user


def seed_users(db):
    authority = get_or_create_user(
        db,
        email="admin@rokhas.ma",
        full_name="System Administrator",
        role="authority",
        password="admin123",
    )

    architects = [
        get_or_create_user(db, email="nora.bekkali@studio.ma", full_name="Nora Bekkali", role="architect"),
        get_or_create_user(db, email="samir.haddad@atelier.ma", full_name="Samir Haddad", role="architect"),
        get_or_create_user(db, email="moad.lahlou@archi.ma", full_name="Moad El Ouichouani", role="architect", password="moad123"),
    ]

    citizen_names = [
        "Youssef Bennani",
        "Fatima Zahra Idrissi",
        "Karim El Fassi",
        "Amine Mansouri",
        "Sanaa Alami",
        "Mehdi Tazi",
        "Laila Chraibi",
        "Omar Gaddari",
        "Salma Filali",
        "Anas Zaki",
        "Sara Cherkaoui",
        "Nabil Belhaj",
        "Hind Alaoui",
        "Rachid El Amrani",
        "Imane Berrada",
    ]
    citizens = [
        get_or_create_user(
            db,
            email=f"{name.lower().replace(' ', '.')}@example.com",
            full_name=name,
            role="citizen",
        )
        for name in citizen_names
    ]

    db.commit()
    return authority, architects, citizens


def seed_dossiers(db, users):
    if db.query(Dossier).count() >= 36:
        return db.query(Dossier).all()

    random.seed(SEED)
    dossier_types = [
        "Construction Permit",
        "Renovation Permit",
        "Demolition Permit",
        "Extension Permit",
        "Business License",
        "Event Permit",
    ]
    zones = ["Residential", "Commercial", "Industrial", "Mixed-use", "Agricultural"]
    statuses = ["Pending", "In Review", "Approved", "Rejected"]
    titles = [
        "Villa Extension Marrakech",
        "Apartment Renovation Casablanca",
        "Industrial Warehouse Phase 1",
        "Downtown Commercial Space",
        "Residential Complex Rabat",
        "Sustainable Office Building",
        "Heritage Site Restoration",
        "Smart City Hub Extension",
        "Mixed-use Development Project",
        "Coastal Resort Renovation",
        "Restaurant Terrace Authorization",
        "Community Hall Event Setup",
    ]

    moroccan_names = [
        "Youssef Bennani", "Fatima Zahra Idrissi", "Karim El Fassi", "Amine Mansouri",
        "Sanaa Alami", "Mehdi Tazi", "Laila Chraibi", "Omar Gaddari", "Salma Filali",
        "Anas Zaki", "Sara Cherkaoui", "Nabil Belhaj", "Hind Alaoui", "Rachid El Amrani",
        "Imane Berrada"
    ]

    existing_titles = {row.title for row in db.query(Dossier.title).all()}
    created = []
    for i in range(36):
        title = f"{titles[i % len(titles)]} #{i + 1:02d}"
        if title in existing_titles:
            continue

        status = statuses[i % len(statuses)]
        height = round(random.uniform(3.2, 28.0), 1)
        setback = round(random.uniform(2.0, 9.5), 1)
        footprint = round(random.uniform(0.22, 0.78), 2)
        surface = round(random.uniform(120.0, 6200.0), 1)
        owner = users[i % len(users)]

        citizen_name = owner.full_name if owner.role == "citizen" else random.choice(moroccan_names)
        
        cin_prefix = random.choice(["AB", "AY", "CD", "BK", "EE", "H", "G"])
        cin_num = random.randint(100000, 999999)
        cin = f"{cin_prefix}{cin_num}"
        
        fee_val = int(4500 + surface * 120)
        fee_str = f"{fee_val:,} DH"
        
        rec_num = random.randint(100000, 999999)
        receipt = f"REC-2026-MA-{rec_num}"
        
        land_prefix = random.choice(["AB", "AY", "CF", "LF", "RT"])
        land_num = random.randint(100, 9999)
        land_ref = f"Conservation Foncière {land_prefix}-{land_num}"
        
        meta_str = f" [REF: {land_ref}] [CITIZEN: {citizen_name}] [CIN: {cin}] [COMMUNE FEE PAID: {fee_str}] [RECEIPT: {receipt}]"

        dossier = Dossier(
            title=title,
            description=(
                f"Seeded {dossier_types[i % len(dossier_types)].lower()} dossier for "
                f"{owner.full_name}, including ownership, zoning, and technical review details.{meta_str}"
            ),
            type=dossier_types[i % len(dossier_types)],
            status=status,
            owner_id=owner.id,
            zone=zones[i % len(zones)],
            hauteur=height,
            recul=setback,
            emprise=footprint,
            surface_terrain=surface,
            ai_analysis=(
                "Preliminary compliance check: "
                f"height {height}m, setback {setback}m, footprint {footprint:.2f}. "
                f"Status recommendation: {status}."
            ),
            created_at=utc_now() - timedelta(days=72 - i),
            updated_at=utc_now() - timedelta(days=max(1, 36 - i)),
        )
        db.add(dossier)
        created.append(dossier)

    db.commit()
    return db.query(Dossier).order_by(Dossier.created_at.desc()).all()


def seed_businesses(db, users):
    if db.query(Business).count() >= 16:
        return

    business_rows = [
        ("Atlas Tech Solutions", "Technology", "Active"),
        ("Marrakech Fine Dining", "Hospitality", "Active"),
        ("Casablanca Logistics", "Logistics", "Active"),
        ("Rabat Financial Hub", "Finance", "Active"),
        ("Tanger Port Services", "Transport", "Active"),
        ("Agadir Tourism Group", "Tourism", "Pending Renewal"),
        ("Fes Artisanal Exports", "Retail", "Active"),
        ("Oujda Energy Systems", "Energy", "Under Review"),
        ("Kenitra Auto Parts", "Manufacturing", "Active"),
        ("Souss Event Makers", "Events", "Active"),
        ("Medina Bookstore Collective", "Retail", "Suspended"),
        ("Rif Green Markets", "Agriculture", "Active"),
        ("Casa Cloud Kitchens", "Food Service", "Under Review"),
        ("Rabat Design Office", "Architecture", "Active"),
        ("El Jadida Marine Works", "Construction", "Active"),
        ("Meknes Learning Center", "Education", "Pending Renewal"),
    ]
    existing_names = {row.name for row in db.query(Business.name).all()}
    for i, (name, business_type, status) in enumerate(business_rows):
        if name in existing_names:
            continue
        db.add(
            Business(
                name=name,
                type=business_type,
                status=status,
                owner_id=users[i % len(users)].id,
                registration_date=utc_now() - timedelta(days=30 + i * 17),
            )
        )
    db.commit()


def seed_evaluations(db, authority, architects, dossiers):
    if db.query(Evaluation).count() >= 24:
        return

    evaluators = [authority, *architects]
    comments = [
        "Complete file with clear site plan and ownership documents.",
        "Minor corrections requested for facade alignment and setbacks.",
        "Technical review confirms structural and zoning compatibility.",
        "Environmental note added before final administrative decision.",
        "Application meets the current urban planning constraints.",
        "Additional business license attachment verified.",
    ]
    existing_refs = {row.project_ref for row in db.query(Evaluation.project_ref).all()}
    for i, dossier in enumerate(dossiers[:28]):
        ref = f"RKH-2026-{dossier.id:04d}"
        if ref in existing_refs:
            continue
        db.add(
            Evaluation(
                project_ref=ref,
                score=round(2.8 + (i % 12) * 0.18, 1),
                comments=comments[i % len(comments)],
                evaluator_id=evaluators[i % len(evaluators)].id,
                created_at=dossier.created_at + timedelta(days=2),
            )
        )
    db.commit()


def seed():
    db = SessionLocal()
    try:
        Base.metadata.create_all(bind=engine)
        authority, architects, citizens = seed_users(db)
        all_applicants = [*citizens, *architects]
        dossiers = seed_dossiers(db, all_applicants)
        seed_businesses(db, all_applicants)
        seed_evaluations(db, authority, architects, dossiers)

        print("Database seeded successfully.")
        print("Authority login: admin@rokhas.ma / admin123")
        print(f"Citizens: {db.query(User).filter(User.role == 'citizen').count()}")
        print(f"Architects: {db.query(User).filter(User.role == 'architect').count()}")
        print(f"Dossiers: {db.query(Dossier).count()}")
        print(f"Businesses: {db.query(Business).count()}")
        print(f"Evaluations: {db.query(Evaluation).count()}")
    except Exception as exc:
        db.rollback()
        print(f"Error seeding database: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
