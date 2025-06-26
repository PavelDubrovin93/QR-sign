from app.models.dtoModels.Entity import Entity
from typing import Optional


class UISettingsDTO(Entity):
    id: Optional[int] = None
    user_id: int
    default_company_choice: Optional[int] = None
    default_color: Optional[str] = '#0000FF'
