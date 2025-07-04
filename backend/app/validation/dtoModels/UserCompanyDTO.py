from typing import Optional

from app.models.dbEnums.RoleType import RoleType
from app.validation.Entity import Entity


class UserCompanyDTO(Entity):
    id: Optional[int] = None
    user_id: int
    company_id: Optional[int] = None
    workgroup_id: Optional[int] = None
    role: Optional[RoleType] = None
