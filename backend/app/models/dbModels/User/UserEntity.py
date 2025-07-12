from sqlalchemy import BigInteger, Column, String
from sqlalchemy.orm import relationship

from app.models.dbModels.EntityDB import EntityDB


class UserEntity(EntityDB):
    __tablename__ = "users"

    tg_id = Column(BigInteger, nullable=False, unique=True)
    name = Column(String(50), nullable=False)
    photo_url = Column(String(150), nullable=True)

    ui_settings = relationship(
        "UISettingsEntity",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    user_company_entities = relationship(
        "UserCompanyEntity", back_populates="user", cascade="all, delete-orphan"
    )
