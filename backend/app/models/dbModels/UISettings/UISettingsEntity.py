from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.models.dbModels.EntityDB import EntityDB


class UISettingsEntity(EntityDB):
    __tablename__ = "ui_settings"

    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    default_company_choice = Column(Integer, ForeignKey("companies.id"))
    default_color = Column(String(50))

    # Связь с пользователем (one-to-one)
    user = relationship("User", back_populates="ui_setting", uselist=False)
    default_company_choice = relationship("companies", back_populates="ui_settings")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "default_company_choice": self.default_company_choice,
            "default_color": self.default_color,
        }
