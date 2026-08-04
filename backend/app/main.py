from fastapi import FastAPI
from app.core.database import Base, engine
from app.models.ticket import Ticket
from app.models.note import Note
from app.routers.tickets import router as ticket_router
from app.routers.dashboard import router as dashboard_router
from app.routers.reports import router as reports_router
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SupportFlow API",version="1.0.0")
app.include_router(ticket_router)
app.include_router(dashboard_router)
app.include_router(reports_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def root():
    return{"message":"Welcome to SupportFLow "}