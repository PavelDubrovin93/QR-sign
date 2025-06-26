from typing import Optional

from app.validation.dtoModels.Entity import Entity


class TaskPointDTO(Entity):
    id: int
    title: str
    taskboard_id: int
    thumbnails: str
    mark_icon: str
    coordinates: list
    points: Optional[dict]
    qrcode: bytes
    description: Optional[str]
    voice_massage: Optional[bytes]
    done_at: Optional[str]
    issued_at: Optional[str]
    warning_at: Optional[str]
