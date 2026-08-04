import os
import uuid
import aiofiles
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
from app.core.config import settings
from app.enums.activity_type import ActivityType
from app.models.attachment import Attachment
from app.models.ticket import Ticket
from app.services.activity_service import log_activity

ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
    "text/plain": ".txt",
    "text/csv": ".csv",
    "application/json": ".json",
}


async def save_attachment(
    db: Session,
    ticket_id: str,
    file: UploadFile,
    actor_name: str | None = None,
):
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    mime = file.content_type or "application/octet-stream"
    if mime not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"File type {mime} not allowed")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = ALLOWED_TYPES.get(mime, "")
    stored_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, stored_name)

    content = await file.read()
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    attachment = Attachment(
        ticket_id=ticket.id,
        filename=file.filename or stored_name,
        stored_name=stored_name,
        mime_type=mime,
        file_size=len(content),
    )
    db.add(attachment)
    log_activity(
        db,
        ticket.id,
        ActivityType.ATTACHMENT_ADDED,
        f"Attachment added: {attachment.filename}",
        actor_name,
    )
    db.commit()
    db.refresh(attachment)
    return attachment


def get_attachment(db: Session, attachment_id: str):
    attachment = db.query(Attachment).filter(Attachment.id == attachment_id).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    return attachment
