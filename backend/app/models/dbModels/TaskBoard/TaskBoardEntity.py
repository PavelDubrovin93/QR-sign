from app.models.dbModels.EntityDB import EntityDB
from sqlalchemy import Column, ForeignKey, Integer, String, ARRAY, Float, Text, DateTime
from sqlalchemy.orm import relationship


class TaskBoardEntity(EntityDB):
    __tablename__ = "task_boards"

    title = Column(String(50), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"))
    work_group_id = Column(Integer, ForeignKey("work_group.id"), nullable=False)
    image = Column(String, nullable=False)
    location = Column(ARRAY(Float), nullable=False)
    type = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    done_at = Column(DateTime, nullable=True)

    def to_dict(self) -> dict:
        return {
            "id": str(self.id), "title": self.title, "work_group_id": self.work_group_id,
            "image": self.image, "location": self.location, "type": self.type,
            "description": self.description, "done_at": self.done_at
            }
