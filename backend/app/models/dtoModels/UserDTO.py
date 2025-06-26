from app.models.dtoModels.Entity import Entity
from typing import Optional


class UserDTO(Entity):
    id: Optional[int] = None
    tg_id: int
    name: str
    photo_url: str
