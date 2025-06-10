from app.models.dbModels.EntityDB import EntityDB
from app.models.dtoModels.TaskPointDTO import TaskPointDTO

from sqlalchemy import Column, ForeignKey, Integer, String, ARRAY, Float, Text, DateTime, LargeBinary, JSON
from sqlalchemy.orm import relationship


class TaskPointEntity(EntityDB):
    __tablename__ = "task_points"

    title = Column(String(50), nullable=False)
    taskboard_id = Column(Integer, ForeignKey("task_boards.id"), nullable=False)
    thumbnails = Column(String, nullable=False)
    mark_icon = Column(String, nullable=False)
    coordinates = Column(ARRAY(Integer), nullable=False)
    points = Column(JSON(Float), nullable=True)
    qrcode = Column(LargeBinary, nullable=False)
    description = Column(Text, nullable=True)
    voice_massage = Column(LargeBinary, nullable=True)
    done_at = Column(DateTime, nullable=True)
    issued_at = Column(DateTime, nullable=True)
    warning_at = Column(DateTime, nullable=True)

    taskboard = relationship("TaskBoardEntity", back_populates="tasks")

    def to_dto(self) -> TaskPointDTO:
        return TaskPointDTO(
            id=self.id,
            title=self.title,
            taskboard_id=self.taskboard_id,
            thumbnails=self.thumbnails,
            mark_icon=self.mark_icon,
            coordinates=self.coordinates,
            points=self.points,
            qrcode=self.qrcode,
            description=self.description,
            voice_message=self.voice_message,
            done_at=self.done_at,
            issued_at=self.issued_at,
            warning_at=self.warning_at
        )

