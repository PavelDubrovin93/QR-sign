from typing import List, Optional
from app.validation.Entity import Entity

class CreateTaskPointResponse(Entity):

    title: str
    taskboard_id: int
    thumbnails: str
    mark_icon: str
    coordinates: list
    points: Optional[dict]
    qrcode: bytes
    description: Optional[str]
    voice_massage: Optional[bytes]


class TaskPointResponse(CreateTaskPointResponse):
    id: int
    done_at: Optional[str]
    issued_at: Optional[str]
    warning_at: Optional[str]


class CreateTaskBoardResponse(Entity):
    title: str
    company_id: int
    work_group_id: int
    image: str
    location: list
    type: str
    description: Optional[str]
    done_at: Optional[str]
    task_points: Optional[List[CreateTaskPointResponse]] = None


class TaskBoardResponse(CreateTaskBoardResponse):
    id: int
