from sqlalchemy.orm import Session
from app.enums.activity_type import ActivityType
from app.models.activity import Activity


def log_activity(
    db: Session,
    ticket_id,
    activity_type: ActivityType,
    description: str,
    actor_name: str | None = None,
) -> Activity:
    activity = Activity(
        ticket_id=ticket_id,
        activity_type=activity_type,
        description=description,
        actor_name=actor_name,
    )
    db.add(activity)
    return activity


def get_ticket_activities(db: Session, ticket_id, limit: int = 50):
    return (
        db.query(Activity)
        .filter(Activity.ticket_id == ticket_id)
        .order_by(Activity.created_at.desc())
        .limit(limit)
        .all()
    )


def get_recent_activities(db: Session, limit: int = 10):
    from app.models.ticket import Ticket

    activities = (
        db.query(Activity, Ticket.ticket_id)
        .join(Ticket, Activity.ticket_id == Ticket.id)
        .order_by(Activity.created_at.desc())
        .limit(limit)
        .all()
    )
    return activities
