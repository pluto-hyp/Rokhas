from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_active_user
from app.models.user import User
from app.schemas.notification import NotificationResponse
from app.crud import notification as crud_notification

router = APIRouter()

@router.get("", response_model=List[NotificationResponse])
def read_notifications(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieve notifications for the current active user.
    """
    return crud_notification.get_notifications_for_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Mark a specific notification as read.
    """
    db_notif = crud_notification.mark_notification_as_read(
        db, notification_id=notification_id, user_id=current_user.id
    )
    if db_notif is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return db_notif

@router.post("/read-all")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Mark all unread notifications of the user as read.
    """
    crud_notification.mark_all_notifications_as_read(db, user_id=current_user.id)
    return {"message": "All notifications marked as read"}
