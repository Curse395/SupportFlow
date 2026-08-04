from sqlalchemy.orm import Session
from app.services.ticket_service import export_tickets_csv, get_all_tickets
from app.services.dashboard_service import get_dashboard_overview


def get_csv_export(db: Session) -> str:
    return export_tickets_csv(db)


def get_monthly_summary(db: Session) -> dict:
    overview = get_dashboard_overview(db)
    return {
        "stats": overview["stats"],
        "tickets_by_month": overview["tickets_by_month"],
        "avg_resolution_hours": overview["avg_resolution_hours"],
        "priority_distribution": overview["priority_distribution"],
        "status_distribution": overview["status_distribution"],
    }
