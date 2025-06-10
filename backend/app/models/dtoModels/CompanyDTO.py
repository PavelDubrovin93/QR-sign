from datetime import datetime
from typing import Optional, HttpUrl

from app.models.dtoModels.Entity import Entity


class CompanyDTO(Entity):
    id: int
    title: str
    description: str | None = None
    subscription_type: str
    expire_at: Optional[datetime] = None
    invite_qr: Optional[bytes] = None
    image_url: Optional[HttpUrl] = None
