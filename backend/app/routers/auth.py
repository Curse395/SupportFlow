from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import LoginRequest, TokenResponse, UserResponse
from app.services.auth_service import get_agents, login
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
def auth_login(credentials: LoginRequest, db: Session = Depends(get_db)):
    return login(db, credentials)


@router.get("/me", response_model=UserResponse)
def auth_me(user: User = Depends(get_current_user)):
    return user


@router.get("/agents", response_model=list[UserResponse])
def list_agents(db: Session = Depends(get_db)):
    return get_agents(db)
