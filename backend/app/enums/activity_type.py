from enum import Enum


class ActivityType(str, Enum):
    COMMENT_ADDED = "Comment Added"
    ATTACHMENT_ADDED = "Attachment Added"
