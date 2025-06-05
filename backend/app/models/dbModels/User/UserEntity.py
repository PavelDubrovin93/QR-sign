from app.models.dbModels.AbstractDB import AbstractDB
from app.models.dbModels.EntityDB import EntityDB
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship


class UserEntity(EntityDB, AbstractDB):
    __tablename__ = "users"

    tg_id = Column(Integer, nullable=False)
    name = Column(String(50), nullable=False)
    company_id = Column(Integer, ForeignKey("company.id"))
    # Доделать свять м2м
    ui_settings = relationship("UISettings", back_populates="user", uselist=False)
    #  Доделать связть o2o

    def to_dict(self) -> dict:
        return {"id": str(self.id), "name": self.name, "company_id": self.company_id}
