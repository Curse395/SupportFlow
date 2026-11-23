from fastapi import FastAPI
from app.routers.tickets import router as ticket_router
from app.routers.dashboard import router as dashboard_router
from app.routers.reports import router as reports_router
from app.routers.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
from app.models import user, ticket, comment, activity, attachment, note

app = FastAPI(title="SupportFlow API",version="1.0.0")
app.include_router(ticket_router)
app.include_router(dashboard_router)
app.include_router(reports_router)
app.include_router(auth_router)
@app.on_event("startup")
def initialize_database():
    Base.metadata.create_all(bind=engine)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "http://127.0.0.1:5173",
                   "http://80.225.236.21",
                   "https://support-flow-bay.vercel.app"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def root():
    return{"message":"Welcome to SupportFLow "}
