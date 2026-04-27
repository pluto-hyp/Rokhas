from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import ALGORITHM
from app.models.user import User
from app.crud import user as crud_user
from app.schemas.token import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

import urllib.request
import json

def get_clerk_public_key():
    jwks_url = f"{settings.CLERK_ISSUER}/.well-known/jwks.json"
    try:
        with urllib.request.urlopen(jwks_url) as url:
            return json.loads(url.read().decode())
    except Exception:
        return None

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        if settings.CLERK_ISSUER:
            jwks = get_clerk_public_key()
            if not jwks:
                raise credentials_exception
            unverified_header = jwt.get_unverified_header(token)
            rsa_key = next((key for key in jwks["keys"] if key["kid"] == unverified_header["kid"]), None)
            
            if not rsa_key:
                raise credentials_exception
                
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=["RS256"],
                issuer=settings.CLERK_ISSUER
            )
            # Clerk uses 'sub' for user ID, but we need an email. 
            # In a real app, we'd map Clerk ID to our user ID or fetch user details from Clerk API.
            # For now, we'll try to get email if passed in custom claims, or fallback to a dummy email for demonstration if not found to prevent complete breakage.
            email: str = payload.get("email") or f"{payload.get('sub')}@rokhas.mock"
            # Extract role from Clerk public metadata (standard claim is 'role' if template is used, or fallback)
            role: str = payload.get("role") or payload.get("public_metadata", {}).get("role") or "citizen"
        else:
            # Fallback to standard JWT if Clerk is not configured
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
            email: str = payload.get("sub")
            role: str = "citizen"
            
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = crud_user.get_user_by_email(db, email=token_data.email)
    if user is None:
        # If user doesn't exist in our DB but authenticated via Clerk, auto-create them for this prototype
        from app.schemas.user import UserCreate
        user_in = UserCreate(email=token_data.email, password="clerk_placeholder", full_name="Clerk User", role=role)
        user = crud_user.create_user(db, user_in)
    elif user.role != role:
        # Sync role if it changed in Clerk
        user.role = role
        db.commit()
        db.refresh(user)
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough privileges")
    return current_user
