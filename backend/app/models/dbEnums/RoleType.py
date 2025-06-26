from enum import Enum


class RoleType(str, Enum):
    EMPLOYER = "employer"
    ADMIN = "admin"
    MEMBER = "member"
    PENDING = "not_approved"