from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.core.security import verify_password, get_password_hash, create_access_token
from app.enums.user_role import UserRole
from app.models.user import User
from app.schemas.user import UserCreate, LoginRequest


DEFAULT_USERS = [
    {
        "email": "admin@supportflow.com",
        "full_name": "Admin User",
        "password": "admin123",
        "role": UserRole.ADMIN,
    },
    {
        "email": "manager@supportflow.com",
        "full_name": "Manager User",
        "password": "manager123",
        "role": UserRole.MANAGER,
    },
    {
        "email": "agent@supportflow.com",
        "full_name": "Support Agent",
        "password": "agent123",
        "role": UserRole.SUPPORT_AGENT,
    },
    {
        "email": "viewer@supportflow.com",
        "full_name": "Viewer User",
        "password": "viewer123",
        "role": UserRole.VIEWER,
    },
]


def seed_default_users(db: Session):
    for user_data in DEFAULT_USERS:
        existing = db.query(User).filter(User.email == user_data["email"]).first()
        if not existing:
            user = User(
                email=user_data["email"],
                full_name=user_data["full_name"],
                hashed_password=get_password_hash(user_data["password"]),
                role=user_data["role"],
            )
            db.add(user)
    db.commit()


def login(db: Session, credentials: LoginRequest):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


def get_agents(db: Session):
    return (
        db.query(User)
        .filter(User.role.in_([UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPPORT_AGENT]))
        .all()
    )
