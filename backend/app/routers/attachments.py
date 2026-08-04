import os
from uuid import UUID
from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_optional_user
from app.models.user import User
from app.schemas.attachment import AttachmentResponse
from app.services.attachment_service import get_attachment, save_attachment

router = APIRouter(prefix="/api/attachments", tags=["Attachments"])


@router.post("/{ticket_id}", response_model=AttachmentResponse)
async def upload_attachment(
    ticket_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    actor = user.full_name if user else None
    return await save_attachment(db, ticket_id, file, actor)


@router.get("/{attachment_id}/download")
def download_attachment(attachment_id: UUID, db: Session = Depends(get_db)):
    attachment = get_attachment(db, str(attachment_id))
    file_path = os.path.join(settings.UPLOAD_DIR, attachment.stored_name)
    return FileResponse(
        path=file_path,
        filename=attachment.filename,
        media_type=attachment.mime_type,
    )
