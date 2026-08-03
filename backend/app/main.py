from fastapi import FastAPI
from app.core.database import Base, engine
from app.models.ticket import Ticket
from app.models.note import Note
from app.routers.tickets import router as ticket_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SupportFlow API",version="1.0.0")
app.include_router(ticket_router)

@app.get("/")
def root():
    return{"message":"Welcome to SupportFLow "}