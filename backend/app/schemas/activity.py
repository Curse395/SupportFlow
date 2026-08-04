from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from app.enums.activity_type import ActivityType


class ActivityResponse(BaseModel):
    id: UUID
    ticket_id: UUID
    activity_type: ActivityType
    description: str
    actor_name: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
