from fastapi import APIRouter,Depends,status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.ticket import TicketCreate, TicketResponse, TicketUpdate ,TicketDetailResponse
from app.services.ticket_service import create_ticket,get_all_tickets,update_ticket,get_ticket_details

router=APIRouter(prefix="/api/tickets",tags=["Tickets"],)


@router.post("/", response_model=TicketResponse,status_code=status.HTTP_201_CREATED,)
def create_new_ticket(
    ticket:TicketCreate,
    db:Session=Depends(get_db),
    ):
    return create_ticket(db,ticket)


@router.get("/",response_model=list[TicketResponse])
def get_tickets(
    status:str | None=None,
    search:str | None=None,
    db: Session=Depends(get_db),
):
    return get_all_tickets(db, status, search)


@router.get("/{ticket_id}",response_model=TicketDetailResponse)
def get_ticket_by_id(ticket_id:str,
                     db: Session=Depends(get_db)
                     ):
    return get_ticket_details(db,ticket_id)

@router.put("/{ticket_id}",response_model=TicketResponse)
def update_existing_ticket(ticket_id:str,
                  ticket:TicketUpdate,
                  db:Session=Depends(get_db)
):
    return update_ticket(db, ticket_id,ticket)