from pydantic import BaseModel

class DashboardStats(BaseModel):
    total_tickets:int 
    open:int
    in_progress:int
    closed:int 