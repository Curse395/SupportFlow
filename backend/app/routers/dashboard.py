from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.dashboard import DashboardStats
from app.services.dashboard_service import get_dashboard_stats
from app.core.security import get_current_user

router=APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
    dependencies=[Depends(get_current_user)],
)

@router.get("/stats",response_model=DashboardStats)
def dashboard_stats(db:Session=Depends(get_db)):
    return get_dashboard_stats(db)
