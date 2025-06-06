from sqlalchemy import Column, Enum, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.models.dbModels.EntityDB import EntityDB


class RoleType(Enum):
    EMPLOYER = "employer"
    ADMIN = "admin"
    MEMBER = "member"


class UserCompanyEntity(EntityDB):
    __tablename__ = "user_company"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    workgroup_id = Column(Integer, ForeignKey("workgroup.id"))
    role = Column(Enum(RoleType), nullable=False)

    # Связи с моделями User и Company
    user = relationship("UserEntity", backref="user_company")
    company = relationship("CompanyEntity", backref="user_company")
    workgroup = relationship("WorkgroupEntity", backref="user_company")
