import uuid
from sqlalchemy import Column, DateTime, Enum, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base
from app.enums.ticket_status import TicketStatus

class Ticket(Base):
    __tablename__="tickets"
    id=Column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    ticket_id=Column(String(20),unique=True,nullable=False)
    customer_name=Column(String(100),nullable=False)
    customer_email=Column(String(255),nullable=False)
    subject=Column(String(255),nullable=False)
    description=Column(Text,nullable=False)
    status=Column(Enum(TicketStatus,name="ticket_status"),
                  nullable=False,
                  default=TicketStatus.OPEN,)
    created_at=Column(DateTime(timezone=True),server_default=func.now())
    updated_at=Column(DateTime(timezone=True),server_default=func.now(),onupdate=func.now(),)