from enum import Enum


class RoleType(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    FOREMAN = "foreman"
    EMPLOYER = "employer"
    PENDING = "not_approved"
