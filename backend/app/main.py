from fastapi import FastAPI
from app.routers.tickets import router as ticket_router
from app.routers.dashboard import router as dashboard_router
from app.routers.reports import router as reports_router
from app.routers.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SupportFlow API",version="1.0.0")
app.include_router(ticket_router)
app.include_router(dashboard_router)
app.include_router(reports_router)
app.include_router(auth_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "http://127.0.0.1:5173",
                   "http://80.225.236.21",
                   "https://support-flow-bay.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def root():
    return{"message":"Welcome to SupportFLow "}
