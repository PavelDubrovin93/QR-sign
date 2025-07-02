from typing import Optional, Union
from datetime import datetime
from app.validation.Entity import Entity


class TaskPointDTO(Entity):
    id: Optional[int] = None
    title: str
    taskboard_id: int
    thumbnails: str
    mark_icon: str
    coordinates: list
    points: Optional[list]
    qrcode: bytes
    description: Optional[str]
    voice_message: Optional[bytes]
    done_at: Optional[Union[str, datetime]] = None
    issued_at: Optional[str] = None
    warning_at: Optional[str] = None


