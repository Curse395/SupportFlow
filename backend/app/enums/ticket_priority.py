from enum import Enum 

class TicketPriority(str, Enum):
    LOW="Low"
    MEDIUM="Medium"
    HIGH="High"
