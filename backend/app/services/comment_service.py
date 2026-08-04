from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.enums.activity_type import ActivityType
from app.models.comment import Comment
from app.models.ticket import Ticket
from app.schemas.comment import CommentCreate
from app.services.activity_service import log_activity


def create_comment(
    db: Session,
    ticket_id: str,
    data: CommentCreate,
    actor_name: str | None = None,
):
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if data.parent_id:
        parent = db.query(Comment).filter(Comment.id == data.parent_id).first()
        if not parent or parent.ticket_id != ticket.id:
            raise HTTPException(status_code=400, detail="Invalid parent comment")

    comment = Comment(
        ticket_id=ticket.id,
        parent_id=data.parent_id,
        author_name=data.author_name or actor_name or "Support Agent",
        content=data.content,
        mentions=data.mentions,
    )
    db.add(comment)
    log_activity(
        db,
        ticket.id,
        ActivityType.COMMENT_ADDED,
        f"Comment added by {comment.author_name}",
        actor_name,
    )
    db.commit()
    db.refresh(comment)
    return comment


def get_ticket_comments(db: Session, ticket_id: str):
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return (
        db.query(Comment)
        .filter(Comment.ticket_id == ticket.id)
        .order_by(Comment.created_at.asc())
        .all()
    )
