from sqlalchemy.orm import Session
from app.models.notification import Notification

def get_notifications_for_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(Notification).filter(
        Notification.user_id == user_id
    ).order_by(
        Notification.created_at.desc()
    ).offset(skip).limit(limit).all()

def create_notification(db: Session, user_id: int, title: str, message: str, dossier_id: int = None):
    db_notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        dossier_id=dossier_id
    )
    db.add(db_notif)
    db.commit()
    db.refresh(db_notif)
    return db_notif

def mark_notification_as_read(db: Session, notification_id: int, user_id: int):
    db_notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    if db_notif:
        db_notif.read = True
        db.commit()
        db.refresh(db_notif)
    return db_notif

def mark_all_notifications_as_read(db: Session, user_id: int):
    db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.read == False
    ).update(
        {Notification.read: True},
        synchronize_session=False
    )
    db.commit()
