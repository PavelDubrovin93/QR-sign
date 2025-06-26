from enum import Enum

from sqlalchemy import Column, DateTime, LargeBinary, String, Text
from sqlalchemy.orm import relationship

from app.models.dbModels.EntityDB import EntityDB
from app.models.dbEnums.SubscriptionType import SubscriptionType

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
