from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import LoginRequest, TokenResponse, UserCreate, UserResponse
from app.services.auth_service import get_agents, login, register
from app.core.security import get_current_user, require_roles
from app.models.user import User
from app.enums.user_role import UserRole

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def auth_register(data: UserCreate, db: Session = Depends(get_db)):
    return register(db, data)


@router.post("/login", response_model=TokenResponse)
def auth_login(credentials: LoginRequest, db: Session = Depends(get_db)):
    return login(db, credentials)


@router.get("/me", response_model=UserResponse)
def auth_me(user: User = Depends(get_current_user)):
    return user


@router.get("/agents", response_model=list[UserResponse])
def list_agents(
    db: Session = Depends(get_db),
    _user: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
):
    return get_agents(db)
