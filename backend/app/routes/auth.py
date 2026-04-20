from __future__ import annotations

import logging
import os

from fastapi import APIRouter, Depends, HTTPException, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from ..auth import create_access_token, get_current_user, hash_password, verify_password
from ..database import get_db
from ..models import User
from ..schemas import GoogleSignInRequest, SignInRequest, SignUpRequest, TokenResponse, UserOut

logger = logging.getLogger("playiq.auth")

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse)
def signup(body: SignUpRequest, db: Session = Depends(get_db)) -> TokenResponse:
    exists = db.scalar(select(User).where(User.email == body.email.lower().strip()))
    if exists:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=body.email.lower().strip(),
        full_name=body.full_name.strip(),
        password_hash=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenResponse(access_token=create_access_token(str(user.id)), user=user)  # type: ignore[arg-type]


@router.post("/signin", response_model=TokenResponse)
def signin(body: SignInRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == body.email.lower().strip()))
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return TokenResponse(access_token=create_access_token(str(user.id)), user=user)  # type: ignore[arg-type]


@router.post("/google", response_model=TokenResponse)
def signin_google(body: GoogleSignInRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """Exchange a Firebase ID token for a PlayIQ JWT. Failures are logged; avoid raw ASGI 500 with no JSON."""
    project_id = os.getenv("FIREBASE_PROJECT_ID")
    if not project_id:
        logger.error("FIREBASE_PROJECT_ID is not set on the API host")
        raise HTTPException(
            status_code=503,
            detail="Server configuration error: FIREBASE_PROJECT_ID is not set on the API.",
        )
    try:
        payload = google_id_token.verify_firebase_token(
            body.id_token,
            google_requests.Request(),
            project_id,
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("Firebase ID token verification failed: %s", exc)
        raise HTTPException(status_code=401, detail="Invalid Google sign-in token") from exc
    email = (payload or {}).get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Google token missing email")
    name = (payload or {}).get("name") or email.split("@")[0]
    try:
        user = db.scalar(select(User).where(User.email == email.lower().strip()))
        if not user:
            user = User(
                email=email.lower().strip(),
                full_name=name.strip()[:120] or "Coach",
                # user authenticates via Google for this path; no password login assumed
                password_hash=hash_password(os.urandom(24).hex()),
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        access_token = create_access_token(str(user.id))
        # Fail fast with a clear log if ORM user cannot become UserOut (e.g. email shape).
        user_out = UserOut.model_validate(user)
        return TokenResponse(access_token=access_token, user=user_out)
    except SQLAlchemyError as exc:
        logger.exception("Database error during Google sign-in")
        raise HTTPException(
            status_code=503,
            detail="Could not complete sign-in (database error). Try again in a moment.",
        ) from exc
    except ValidationError as exc:
        logger.exception("User payload failed validation after Google sign-in")
        raise HTTPException(
            status_code=500,
            detail="Sign-in succeeded but user profile could not be serialized. Check server logs.",
        ) from exc
    except Exception as exc:
        logger.exception("Unexpected error during Google sign-in (hash/JWT/response)")
        raise HTTPException(
            status_code=500,
            detail="Google sign-in failed on the server. Check API deploy logs for the traceback.",
        ) from exc


@router.get("/me", response_model=UserOut)
def me(current: User = Depends(get_current_user)) -> UserOut:
    return current  # type: ignore[return-value]

