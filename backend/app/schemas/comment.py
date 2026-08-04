from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class CommentCreate(BaseModel):
    content: str
    parent_id: Optional[UUID] = None
    mentions: Optional[str] = None
    author_name: str = "Support Agent"


class CommentResponse(BaseModel):
    id: UUID
    ticket_id: UUID
    parent_id: Optional[UUID] = None
    author_name: str
    content: str
    mentions: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
