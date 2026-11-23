from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app.core.security import verify_password, get_password_hash, create_access_token
from app.enums.user_role import UserRole
from app.models.user import User
from app.schemas.user import UserCreate, LoginRequest


_DUMMY_PASSWORD_HASH = get_password_hash("unknown-account-password")


def register(db: Session, data: UserCreate):
    email = str(data.email).strip().lower()
    existing = db.query(User).filter(func.lower(User.email) == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        email=email,
        full_name=data.full_name.strip(),
        hashed_password=get_password_hash(data.password),
        role=UserRole.SUPPORT_AGENT,
        is_active=True,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        ) from None
    db.refresh(user)
    token = create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer", "user": user}


def login(db: Session, credentials: LoginRequest):
    email = str(credentials.email).strip().lower()
    user = db.query(User).filter(func.lower(User.email) == email).first()
    password_valid = verify_password(
        credentials.password,
        user.hashed_password if user else _DUMMY_PASSWORD_HASH,
    )
    if not user or not password_valid or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer", "user": user}


def get_agents(db: Session):
    return (
        db.query(User)
        .filter(User.role.in_([UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPPORT_AGENT]))
        .all()
    )
