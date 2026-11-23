import uuid
from sqlalchemy import Boolean, Column, DateTime, Enum, Index, String
from sqlalchemy import Uuid
from sqlalchemy.sql import func
from app.core.database import Base
from app.enums.user_role import UserRole


class User(Base):
    __tablename__ = "users"
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(
        Enum(UserRole, name="user_role"),
        nullable=False,
        default=UserRole.SUPPORT_AGENT,
        server_default=UserRole.SUPPORT_AGENT.name,
    )
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True, server_default="true")
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    __table_args__ = (
        Index("uq_users_email_lower", func.lower(email), unique=True),
    )
