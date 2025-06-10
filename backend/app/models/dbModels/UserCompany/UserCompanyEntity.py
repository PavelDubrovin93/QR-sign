from enum import Enum

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.models.dbModels.EntityDB import EntityDB
from app.models.dtoModels.UserCompanyDTO import UserCompanyDTO



class RoleType(str, Enum):
    EMPLOYER = "employer"
    ADMIN = "admin"
    MEMBER = "member"


class UserCompanyEntity(EntityDB):
    __tablename__ = "user_company"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    workgroup_id = Column(Integer, ForeignKey("work_group.id"), nullable=True)
    role = Column(String(50), nullable=False)

    user = relationship("UserEntity", back_populates="user_company_entities")
    company = relationship("CompanyEntity", back_populates="user_company_entities")
    work_groups = relationship("WorkGroupEntity", back_populates="user_company_entities")

    def __init__(self, role: RoleType, **kwargs):
        super().__init__(**kwargs)
        self.role = role.value

    def to_dto(self):
        return UserCompanyDTO(
            id=self.id,
            user_id=self.user_id,
            company_id=self.company_id,
            workgroup_id=self.workgroup_id,
            role=self.role
        )
