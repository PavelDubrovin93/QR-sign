import uuid

from models.dtoModels.Entity import Entity


class UserDTO(Entity):
    id: uuid.UUID
    name: str
    email: str
