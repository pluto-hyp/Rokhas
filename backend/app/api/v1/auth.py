from datetime import timedelta
import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import verify_password, create_access_token
from app.crud import user as crud_user
from app.schemas.user import UserCreate, UserResponse
from app.schemas.token import Token
from app.api.dependencies import get_db
from pydantic import BaseModel

router = APIRouter()


class GoogleAuthRequest(BaseModel):
    id_token: str


def create_user_token(email: str) -> Token:
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=email, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = crud_user.get_user_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    return create_user_token(user.email)

@router.post("/register", response_model=UserResponse)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    user = crud_user.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = crud_user.create_user(db, user=user_in)
    return user


@router.post("/google", response_model=Token)
async def google_access_token(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": payload.id_token},
        )

    if response.status_code != status.HTTP_200_OK:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    google_user = response.json()
    email = google_user.get("email")
    email_verified = google_user.get("email_verified")
    audience = google_user.get("aud")

    if audience != settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=401, detail="Google token audience mismatch")
    if not email or str(email_verified).lower() != "true":
        raise HTTPException(status_code=401, detail="Google email is not verified")

    user = crud_user.get_user_by_email(db, email=email)
    if not user:
        user = crud_user.create_user(
            db,
            user=UserCreate(
                email=email,
                full_name=google_user.get("name") or email.split("@")[0],
                password=secrets.token_urlsafe(32),
                role="citizen",
            ),
        )
    elif user.role != "citizen":
        user.role = "citizen"
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    return create_user_token(user.email)
