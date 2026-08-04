from enum import Enum


class UserRole(str, Enum):
    ADMIN = "Admin"
    MANAGER = "Manager"
    SUPPORT_AGENT = "Support Agent"
    VIEWER = "Viewer"
