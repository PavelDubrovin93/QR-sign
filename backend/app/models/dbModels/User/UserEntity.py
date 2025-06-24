from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.models.dbModels.EntityDB import EntityDB


class UserEntity(EntityDB):
    __tablename__ = "users"

    tg_id = Column(Integer, nullable=False)
    name = Column(String(50), nullable=False)
    photo_url = Column(String(150), nullable=True)


    ui_settings = relationship("UISettingsEntity", back_populates="user", uselist=False)
    user_company_entities = relationship("UserCompanyEntity", back_populates="user")
