from enum import Enum


class RoleType(str, Enum):
    EMPLOYER = "employer"
    ADMIN = "admin"
    FOREMAN = "foreman"
    MEMBER = "member"
    PENDING = "not_approved"
