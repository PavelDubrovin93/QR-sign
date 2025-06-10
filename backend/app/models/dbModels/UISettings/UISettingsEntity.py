from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.models.dbModels.EntityDB import EntityDB
from app.models.dtoModels.UISettingsDTO import UISettingsDTO



class UISettingsEntity(EntityDB):
    __tablename__ = "ui_settings"

    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    default_company_choice = Column(Integer, ForeignKey("companies.id"))
    default_color = Column(String(50))

    user = relationship("UserEntity", cascade="all, delete-orphan", back_populates="ui_settings", uselist=False)
    default_company = relationship("CompanyEntity", back_populates="ui_settings")

    def to_dto(self):
        return UISettingsDTO(
            id=self.id,
            user_id=self.user_id,
            default_company_choice=self.default_company_choice,
            default_color=self.default_color
        )
