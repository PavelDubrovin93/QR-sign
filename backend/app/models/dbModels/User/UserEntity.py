from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.models.dbModels.EntityDB import EntityDB
from app.models.dtoModels.UserDTO import UserDTO


class UserEntity(EntityDB):
    __tablename__ = "users"

    tg_id = Column(Integer, nullable=False)
    name = Column(String(50), nullable=False)

    ui_settings = relationship("UISettingsEntity", back_populates="user", uselist=False)
    user_company_entities = relationship("UserCompanyEntity", back_populates="user")

    def to_dto(self) -> UserDTO:
        return UserDTO(
            id=self.id,
            name=self.name,
            tg_id=self.tg_id,
            ui_settings=self.ui_settings
        )
