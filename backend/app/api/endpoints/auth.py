from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
import httpx
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse, Token, PasswordUpdate
from app.api.deps import get_current_user
from app.core.security import get_password_hash, verify_password, create_access_token, settings

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ── Request body schemas ────────────────────────────────────────────────────
class GoogleLoginRequest(BaseModel):
    access_token: str

@router.post("/google-login", response_model=Token)
def google_login(body: GoogleLoginRequest, db: Session = Depends(get_db)):
    """
    Accept a Google OAuth2 access_token (from useGoogleLogin implicit flow)
    and exchange it for a platform JWT. Verification is done by calling
    Google's userinfo endpoint — no GOOGLE_CLIENT_ID needed.
    """
    try:
        # Verify the access token by fetching the user’s profile from Google
        resp = httpx.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {body.access_token}"},
            timeout=10,
        )
        if resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired Google access token",
            )

        user_info = resp.json()
        email = user_info.get("email")
        if not email or not user_info.get("email_verified"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Google account email not verified",
            )

        # Find or create user
        user = db.query(User).filter(User.email == email).first()
        if not user:
            import secrets
            user = User(
                email=email,
                hashed_password=get_password_hash(secrets.token_urlsafe(32)),
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Issue platform JWT
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            subject=user.id, email=email, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}

    except HTTPException:
        raise
    except Exception as exc:
        print(f"❌ Google login error: {exc}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google authentication failed",
        )

@router.post("/set-password")
def set_password(
    data: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.hashed_password = get_password_hash(data.new_password)
    db.add(current_user)
    db.commit()
    return {"message": "Password updated successfully"}

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
        subject=user.id, email=user.email, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
    
@router.post("/settings")
def update_settings(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    import json
    if "notification_prefs" in data:
        current_user.notification_prefs = json.dumps(data["notification_prefs"])
    db.add(current_user)
    db.commit()
    return {"message": "Settings updated"}

@router.post("/generate-key")
def generate_api_key(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    import secrets
    new_key = f"ana_live_{secrets.token_urlsafe(24)}"
    current_user.api_key = new_key
    db.add(current_user)
    db.commit()
    return {"api_key": new_key}
