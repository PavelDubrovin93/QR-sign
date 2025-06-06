from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.models.dbModels.EntityDB import EntityDB


class UISetting(EntityDB):
    __tablename__ = "ui_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    default_company_choice = Column(Integer, ForeignKey("companies.id"))
    default_color = Column(String(50))

    # Связь с пользователем (one-to-one)
    user = relationship("User", back_populates="ui_setting", uselist=False)
    default_company_choice = relationship("Company", back_populates="ui_settings")
