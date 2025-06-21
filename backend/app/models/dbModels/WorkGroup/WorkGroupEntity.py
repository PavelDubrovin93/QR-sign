from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.models.dbModels.EntityDB import EntityDB


class WorkGroupEntity(EntityDB):
    __tablename__ = "work_group"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(255), nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)

    company = relationship("CompanyEntity", cascade="all, delete-orphan", back_populates="work_groups", single_parent=True)
    user_company_entities = relationship(
        "UserCompanyEntity", back_populates="work_groups"
    )
    task_boards = relationship("TaskBoardEntity", back_populates="work_groups")
