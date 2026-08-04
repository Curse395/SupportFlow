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


def get_dashboard_overview(db: Session) -> dict:
    tickets = db.query(Ticket).all()
    stats = get_dashboard_stats(db)
    tickets_by_month = {}
    priority_distribution = {"Low": 0, "Medium": 0, "High": 0}
    status_distribution = {"Open": 0, "In Progress": 0, "Closed": 0}
    resolution_hours = []

    for ticket in tickets:
        if ticket.created_at:
            month = ticket.created_at.strftime("%Y-%m")
            tickets_by_month[month] = tickets_by_month.get(month, 0) + 1

        priority_distribution[ticket.priority.value] = (
            priority_distribution.get(ticket.priority.value, 0) + 1
        )
        status_distribution[ticket.status.value] = (
            status_distribution.get(ticket.status.value, 0) + 1
        )

        if ticket.status == TicketStatus.CLOSED and ticket.created_at and ticket.updated_at:
            resolution_hours.append(
                (ticket.updated_at - ticket.created_at).total_seconds() / 3600
            )

    average_resolution_hours = (
        round(sum(resolution_hours) / len(resolution_hours), 1)
        if resolution_hours
        else None
    )

    return {
        "stats": stats,
        "tickets_by_month": tickets_by_month,
        "avg_resolution_hours": average_resolution_hours,
        "priority_distribution": priority_distribution,
        "status_distribution": status_distribution,
    }
