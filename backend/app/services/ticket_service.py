import uuid
from sqlalchemy.orm import Session
from sqlalchemy import or_ 
from fastapi import HTTPException, status
from app.enums.ticket_status import TicketStatus
from app.models.ticket import Ticket 
from app.schemas.ticket import TicketCreate



def create_ticket(db:Session, ticket:TicketCreate):

    try:
        db_ticket=Ticket(
                ticket_id=f"TKT_{uuid.uuid4().hex[:8].upper()}",
                customer_name=ticket.customer_name,
                customer_email=ticket.customer_email,
                subject=ticket.subject,
                description=ticket.description,
                status=TicketStatus.OPEN,
                )

        db.add(db_ticket)
        db.commit()
        db.refresh(db_ticket)

        return db_ticket

    except Exception as e:
        db.rollback()
        raise e



def get_all_tickets(db:Session,status:str | None=None, search:  str | None=None):
    query =db.query(Ticket)

    if status:
        query=query.filter(Ticket.status==status)

    if search:
        query=query.filter(
            or_(
                Ticket.customer_name.ilike(f"%{search}%"),
                Ticket.customer_email.ilike(f"%{search}%"),
                Ticket.subject.ilike(f"%{search}%"),
                Ticket.ticket_id.ilike(f"%{search}%"),
            )
        )

    return query.order_by(Ticket.created_at.desc()).all()


def get_ticket_by_id(db: Session, ticket_id:str):
    ticket =(db.query(Ticket).filter(Ticket.ticket_id==ticket_id).first())

    if not ticket:
        raise HTTPException(
            status_code=404,detail="Ticket could not be found"
        )
    return ticket