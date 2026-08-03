import uuid
from sqlalchemy.orm import Session
from app.enums.ticket_status import TicketStatus
from app.models.ticket import Ticket 
from app.schemas.ticket import TicketCreate

def create_ticket(db:Session, ticket:TicketCreate):
    db_ticket=Ticket(
        ticket_id=f"TKT_{uuid.uuid4().hex[:8].upper()}",
        customer_name=ticket.customer_name,
        customer_email=ticket.customer_email,
        subject=ticket.subject,
        description=ticket.description,
        status=TicketStatus.OPEN,
    )

    db.add(db_ticket)
    db.commit
    db.refresh(db_ticket)

    return db_ticket