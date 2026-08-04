import uuid
from sqlalchemy.orm import Session
from sqlalchemy import or_ 
from fastapi import HTTPException, status
from app.enums.ticket_status import TicketStatus
from app.models.ticket import Ticket 
from app.schemas.ticket import TicketCreate, TicketUpdate
from app.models.note import Note 



def create_ticket(db:Session, ticket:TicketCreate):

    try:
        db_ticket=Ticket(
                ticket_id=f"TKT_{uuid.uuid4().hex[:8].upper()}",
                customer_name=ticket.customer_name,
                customer_email=ticket.customer_email,
                subject=ticket.subject,
                description=ticket.description,
                status=TicketStatus.OPEN,
                priority=ticket.priority,
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
                Ticket.description.ilike(f"%{search}%")
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

def update_ticket(db:Session, ticket_id:str, ticket_update:TicketUpdate):
    ticket=(db.query(Ticket).filter(Ticket.ticket_id==ticket_id).first())

    if not ticket:
        raise HTTPException(
            status_code=404,detail="Ticket could not be found"
        )

    ticket.status=ticket_update.status


    if ticket_update.note_text:
        note=Note(
            ticket_id=ticket.id,
            note_text=ticket_update.note_text
        )

        db.add(note)

    if ticket_update.priority:
        ticket.priority=ticket_update.priority

    db.commit()
    db.refresh(ticket)
    return ticket 

def get_ticket_details(db: Session,ticket_id:str):
    ticket=(db.query(Ticket).filter(Ticket.ticket_id==ticket_id).first())
    notes=(db.query(Note).filter(Note.ticket_id==ticket.id).order_by(Note.created_at.asc()).all())

    if not ticket:
        raise HTTPException(status_code=404,detail="ticket not found")

    return{"ticket":ticket,
           "notes":notes}
