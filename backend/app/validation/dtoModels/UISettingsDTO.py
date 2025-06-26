from typing import Optional

from app.validation.Entity import Entity


class UISettingsDTO(Entity):
    id: Optional[int] = None
    user_id: Optional[int] = None
    default_company_choice: Optional[int] = None
    default_color: Optional[str] = "#0000FF"
