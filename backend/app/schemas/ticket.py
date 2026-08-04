from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict,EmailStr
from app.enums.ticket_status import TicketStatus
from app.enums.ticket_priority import TicketPriority

class TicketCreate(BaseModel):
    customer_name:str
    customer_email:EmailStr
    subject:str
    description:str
    priority:TicketPriority=TicketPriority.MEDIUM

class TicketUpdate(BaseModel):
    status:TicketStatus
    note_text:Optional[str]=None
    priority:Optional[TicketPriority]=None 

class TicketResponse(BaseModel):
    id:UUID
    ticket_id:str
    customer_name:str
    customer_email:EmailStr
    subject:str
    description:str
    status:TicketStatus
    created_at:datetime
    updated_at:Optional[datetime]
    priority:TicketPriority

    model_config=ConfigDict(from_attributes=True)