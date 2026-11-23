from datetime import datetime, timedelta, timezone
from hashlib import sha256
from uuid import UUID

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.enums.user_role import UserRole
from app.models.user import User

ALGORITHM = "HS256"
TOKEN_ISSUER = "supportflow"
password_hasher = PasswordHasher()
bearer_scheme = HTTPBearer(auto_error=False)
_secret_key = settings.JWT_SECRET_KEY.get_secret_value()
if len(_secret_key.encode("utf-8")) < 32:
    _secret_key = sha256(settings.DATABASE_URL.encode("utf-8")).hexdigest()


def get_password_hash(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return password_hasher.verify(hashed_password, plain_password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    now = datetime.now(timezone.utc)
    expires_at = now + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    claims = {
        "sub": subject,
        "iss": TOKEN_ISSUER,
        "iat": now,
        "exp": expires_at,
    }
    return jwt.encode(claims, _secret_key, algorithm=ALGORITHM)


def _unauthorized() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def _resolve_user_from_credentials(
    credentials: HTTPAuthorizationCredentials,
    db: Session,
) -> User:
    if credentials.scheme.lower() != "bearer":
        raise _unauthorized()

    try:
        claims = jwt.decode(
            credentials.credentials,
            _secret_key,
            algorithms=[ALGORITHM],
            issuer=TOKEN_ISSUER,
            options={"require": ["exp", "iat", "iss", "sub"]},
        )
        user_id = UUID(claims["sub"])
    except (jwt.InvalidTokenError, KeyError, TypeError, ValueError):
        raise _unauthorized() from None

    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        raise _unauthorized()
    return user


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise _unauthorized()
    return _resolve_user_from_credentials(credentials, db)


def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User | None:
    if credentials is None:
        return None
    return _resolve_user_from_credentials(credentials, db)


def require_roles(*allowed_roles: UserRole):
    def role_dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action.",
            )
        return user

    return role_dependency
