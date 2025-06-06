from sqlalchemy import LargeBinary, Column, DateTime, String, Text
from sqlalchemy.types import TypeDecorator, TEXT
from sqlalchemy.orm import relationship

from app.models.dbModels.EntityDB import EntityDB
from enum import Enum

class SubscriptionType(str, Enum):
    PERSONNEL = "personnel"
    ENTERPRISE = "enterprise"
    OTHER = "other"

class CompanyEntity(EntityDB):
    __tablename__ = "companies"

    title = Column(String(255), nullable=False)
    image = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    subscription_type = Column(String(50), nullable=False)
    expire_at = Column(DateTime, nullable=True)
    invite_qr = Column(LargeBinary, nullable=True)

    # Связь с пользователями (один ко многим)
    user_company_entities = relationship("UserCompanyEntity", back_populates="company")
    ui_settings = relationship("UISettingsEntity", back_populates="default_company_choice")


    def to_dict(self) -> dict:
        return {"id": str(self.id), "name": self.name, "company_id": self.company_id}