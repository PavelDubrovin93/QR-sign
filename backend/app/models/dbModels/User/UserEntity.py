from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.models.dbModels.EntityDB import EntityDB


class UserEntity(EntityDB):
    __tablename__ = "users"

    tg_id = Column(Integer, nullable=False)
    name = Column(String(50), nullable=False)
    ui_settings = relationship("UISettings", back_populates="user", uselist=False)
    #  Доделать связть o2o
    user_company_entities = relationship("UserCompanyEntity", back_populates="user")

    def to_dict(self) -> dict:
        return {"id": str(self.id), "name": self.name, "company_id": self.company_id}
