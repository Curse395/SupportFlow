import uuid
from sqlalchemy import Column,DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func 
from app.core.database import Base

class Note(Base):
    __tablename__="notes"
    id=Column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    ticket_id=Column(UUID(as_uuid=True),ForeignKey("tickets.id",ondelete="CASCADE"),nullable=False)
    note_text=Column(Text,nullable=False)
    created_at=Column(DateTime(timezone=True),server_default=func.now())