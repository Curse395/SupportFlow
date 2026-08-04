from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_optional_user
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentResponse
from app.services.comment_service import create_comment, get_ticket_comments

router = APIRouter(prefix="/api/comments", tags=["Comments"])


@router.get("/{ticket_id}", response_model=list[CommentResponse])
def list_comments(ticket_id: str, db: Session = Depends(get_db)):
    return get_ticket_comments(db, ticket_id)


@router.post("/{ticket_id}", response_model=CommentResponse)
def add_comment(
    ticket_id: str,
    data: CommentCreate,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    actor = user.full_name if user else None
    if user and not data.author_name:
        data = data.model_copy(update={"author_name": user.full_name})
    return create_comment(db, ticket_id, data, actor)
