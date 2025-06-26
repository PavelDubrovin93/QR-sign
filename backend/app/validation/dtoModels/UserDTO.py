from typing import Optional

from app.validation.Entity import Entity


class UserDTO(Entity):
    id: Optional[int] = None
    tg_id: int
    name: str
    photo_url: str
