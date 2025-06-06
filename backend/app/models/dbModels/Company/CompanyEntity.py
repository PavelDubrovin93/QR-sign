from sqlalchemy import URL, Binary, Column, DateTime, Enum, String, Text
from sqlalchemy.orm import relationship

from app.models.dbModels.EntityDB import EntityDB


class SubscriptionType(Enum):
    PERSONNEL = "personnel"
    ENTERPRISE = "enterprise"
    OTHER = "other"


class CompanyEntity(EntityDB):
    __tablename__ = "companies"

    title = Column(String(255), nullable=False)
    image = Column(URL, nullable=True)
    description = Column(Text, nullable=True)
    subscription_type = Column(Enum(SubscriptionType), nullable=False)
    expire_at = Column(DateTime, nullable=True)
    invite_qr = Column(Binary, nullable=True)

    # Связь с пользователями (один ко многим)
    user_company_entities = relationship("UserCompanyEntity", back_populates="company")
    ui_settings = relationship("UISetting", back_populates="default_company_choice")

    def to_dict(self) -> dict:
        return {"id": str(self.id), "name": self.name, "company_id": self.company_id}
