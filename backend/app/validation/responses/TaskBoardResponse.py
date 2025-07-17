from datetime import datetime
from typing import List, Optional, Union

from app.validation.Entity import Entity


class TaskPointResponse(Entity):
    id: Optional[int] = None
    title: str
    thumbnails: str
    mark_icon: str
    coordinates: List[float]
    points: Optional[list]
    qrcode: bytes
    description: Optional[str]
    voice_message: Optional[bytes] = None
    taskboard_id: Optional[int] = None
    done_at: Optional[datetime] = None
    issued_at: Optional[str] = None
    warning_at: Optional[str] = None


class CreateTaskBoardResponse(Entity):
    title: str
    company_id: int
    work_group_id: int
    image: str
    location: list
    type: str
    description: Optional[str]
    task_points: Optional[List[TaskPointResponse]] = None


class TaskBoardResponse(CreateTaskBoardResponse):
    id: int
    done_at: Optional[str] = None
