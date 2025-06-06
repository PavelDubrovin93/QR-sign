from sqlalchemy import Column, String, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.models.dbModels.EntityDB import EntityDB
from enum import Enum

class RoleType(str, Enum):
    EMPLOYER = "employer"
    ADMIN = "admin"
    MEMBER = "member"


class UserCompanyEntity(EntityDB):
    __tablename__ = "user_company"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    workgroup_id = Column(Integer, ForeignKey("work_group.id"))
    role = Column(String(50), nullable=False)

    # Связи с моделями User и Company
    user = relationship("UserEntity", backref="user_company")
    company = relationship("CompanyEntity", backref="user_company")
    workgroup = relationship("WorkgroupEntity", backref="user_company")

    def __init__(self, role: RoleType, **kwargs):
        super().__init__(**kwargs)
        self.role = role.value

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": self.user_id,
            "company_id": self.company_id,
            "workgroup_id": self.workgroup_id,
            "role": self.role,
        }