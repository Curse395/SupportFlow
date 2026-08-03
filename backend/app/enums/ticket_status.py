from enum import Enum

class TicketStatus(str,Enum):
    OPEN="Open"
    IN_PROGRESS="In Progress"
    CLOSED="Closed"