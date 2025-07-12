from datetime import datetime
from typing import List, Optional, Union

from app.validation.Entity import Entity


class CreateTaskPointResponse(Entity):
    title: str
    thumbnails: str
    mark_icon: str
    coordinates: List[float]
    points: Optional[list]
    qrcode: bytes
    description: Optional[str]
    voice_message: Optional[bytes] = None


class TaskPointResponse(CreateTaskPointResponse):
    id: int
    done_at: Optional[datetime] = None
    issued_at: Optional[str] = None
    warning_at: Optional[str] = None
    taskboard_id: Optional[int] = None


class CreateTaskBoardResponse(Entity):
    title: str
    company_id: int
    work_group_id: int
    image: str
    location: list
    type: str
    description: Optional[str]
    task_points: Optional[List[CreateTaskPointResponse]] = None


class TaskBoardResponse(CreateTaskBoardResponse):
    id: int
    done_at: Optional[str] = None
    task_points: Optional[
        Union[List[TaskPointResponse], List[CreateTaskPointResponse]]
    ] = None
