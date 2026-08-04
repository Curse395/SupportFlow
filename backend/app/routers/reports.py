from fastapi import APIRouter, Depends
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.report_service import get_csv_export, get_monthly_summary

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/export/csv", response_class=PlainTextResponse)
def export_csv(db: Session = Depends(get_db)):
    return PlainTextResponse(
        content=get_csv_export(db),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=tickets.csv"},
    )


@router.get("/monthly-summary")
def monthly_summary(db: Session = Depends(get_db)):
    return get_monthly_summary(db)
