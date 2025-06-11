from enum import Enum

from sqlalchemy import Column, DateTime, LargeBinary, String, Text
from sqlalchemy.orm import relationship

from app.models.dbModels.EntityDB import EntityDB
from app.models.dtoModels.CompanyDTO import CompanyDTO


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

    user_company_entities = relationship("UserCompanyEntity", back_populates="company")
    ui_settings = relationship(
        "UISettingsEntity",
        back_populates="default_company",
        cascade="all, delete-orphan",  # кажется это надо убрать
    )
    work_groups = relationship("WorkGroupEntity", back_populates="company")
    task_boards = relationship("TaskBoardEntity", back_populates="company")

    def to_dto(self) -> CompanyDTO:
        return CompanyDTO(
            id=self.id,
            title=self.title,
            description=self.description,
            subscription_type=self.subscription_type,
            expire_at=self.expire_at,
            invite_qr=self.invite_qr,
        )
