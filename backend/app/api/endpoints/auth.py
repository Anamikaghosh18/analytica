from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse, Token
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.core.security import get_password_hash, verify_password, create_access_token, settings

router = APIRouter()

@router.post("/google-login", response_model=Token)
def google_login(token_id: str, db: Session = Depends(get_db)):
    try:
        # Verify the Google ID token
        id_info = id_token.verify_oauth2_token(
            token_id, google_requests.Request(), settings.google_client_id
        )

        # ID token is valid. Get the user's Google ID and email.
        email = id_info['email']
        
        # Check if user already exists
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            # Create a new user if they don't exist
            # We generate a random password as it won't be used for Google login
            import secrets
            user = User(
                email=email,
                hashed_password=get_password_hash(secrets.token_urlsafe(32)),
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
        # Create access token
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            subject=user.id, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}

    except ValueError:
        # Invalid token
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
        )

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/token", response_model=Token)
def login_for_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
