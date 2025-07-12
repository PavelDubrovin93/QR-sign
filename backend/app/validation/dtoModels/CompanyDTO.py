from datetime import datetime
from typing import Optional


from app.validation.Entity import Entity


class CompanyDTO(Entity):
    id: Optional[int] = None
    title: str
    description: str | None = None
    subscription_type: Optional[str] = None
    expire_at: Optional[datetime] = None
    invite_qr: Optional[bytes] = None
    image_url: Optional[str] = None
