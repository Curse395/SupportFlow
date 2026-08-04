from sqlalchemy.orm import Session
from app.enums.ticket_status import TicketStatus
from app.models.ticket import Ticket

def get_dashboard_stats(db:Session):
    tickets=db.query(Ticket).all()
    return{
        "total_tickets":len(tickets),
        "open":sum(ticket.status==TicketStatus.OPEN
                   for ticket in tickets),
        "in_progress":sum(ticket.status==TicketStatus.IN_PROGRESS
                          for ticket in tickets),
        "closed":sum(ticket.status==TicketStatus.CLOSED
                     for ticket in tickets)
    }