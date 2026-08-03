from fastapi import FastAPI
from app.core.database import Base, engine
from app.models.ticket import Ticket
from app.models.note import Note

print("Creating tables....")
Base.metadata.create_all(bind=engine)
print("Tabels created")
app = FastAPI(
    title="SupportFlow API",
    version="1.0.0",
)

@app.get("/")
def root():
    return{"message":"Welcome to SupportFLow "}