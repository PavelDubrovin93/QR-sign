from app.models.dtoModels.Entity import Entity


class TaskPointDTO(Entity):
    id: int
    title: str
    taskboard: int
    thumbnails: str
    mark_icon: str
    coordinates: list
    points: dict
    qrcode: str
    description: str
    voice_massage: str
    done_at: str
    issued_at: str
    warning_at: str
