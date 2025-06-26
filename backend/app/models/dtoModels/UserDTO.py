from typing import Optional

from app.validation.dtoModels.Entity import Entity


class UserDTO(Entity):
    id: Optional[int] = None
    tg_id: int
    name: str
    photo_url: str
