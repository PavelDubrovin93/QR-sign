from sqlalchemy import (ARRAY, Column, DateTime, Float, ForeignKey, Integer,
                        String, Text)
from sqlalchemy.orm import relationship

from app.models.dbModels.EntityDB import EntityDB


class TaskBoardEntity(EntityDB):
    __tablename__ = "task_boards"

    title = Column(String(50), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"))
    work_group_id = Column(Integer, ForeignKey("work_group.id"), nullable=True)
    image = Column(String, nullable=False)
    location = Column(ARRAY(Float), nullable=False)
    type = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    done_at = Column(DateTime, nullable=True)

    company = relationship("CompanyEntity", back_populates="task_boards")
    work_groups = relationship("WorkGroupEntity", back_populates="task_boards")
    tasks = relationship(
        "TaskPointEntity", back_populates="taskboard", cascade="all, delete-orphan"
    )
