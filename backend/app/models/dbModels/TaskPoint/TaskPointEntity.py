from sqlalchemy import (ARRAY, Column, DateTime, ForeignKey,
                        Integer, LargeBinary, String, Text)
from sqlalchemy.orm import relationship

from app.models.dbModels.EntityDB import EntityDB


class TaskPointEntity(EntityDB):
    __tablename__ = "task_points"

    title = Column(String(50), nullable=False)
    taskboard_id = Column(Integer, ForeignKey("task_boards.id"), nullable=False)
    thumbnails = Column(String, nullable=False)
    mark_icon = Column(String, nullable=False)
    coordinates = Column(ARRAY(Integer), nullable=False)
    points = Column(ARRAY(Integer), nullable=True)
    qrcode = Column(LargeBinary, nullable=False)
    description = Column(Text, nullable=True)
    voice_massage = Column(LargeBinary, nullable=True)
    done_at = Column(DateTime, nullable=True)
    issued_at = Column(DateTime, nullable=True)
    warning_at = Column(DateTime, nullable=True)

    taskboard = relationship("TaskBoardEntity", back_populates="tasks")
