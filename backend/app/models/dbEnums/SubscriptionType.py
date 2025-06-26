from enum import Enum


class SubscriptionType(str, Enum):
    PERSONNEL = "personnel"
    ENTERPRISE = "enterprise"
    OTHER = "other"
