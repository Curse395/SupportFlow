from datetime import datetime
from pydantic import BaseModel
from uuid import UUID

class NoteResponse(BaseModel):
    id:UUID
    note_text:str
    created_at:datetime

    model_config={"from_attributes":True}