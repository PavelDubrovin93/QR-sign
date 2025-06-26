from app.models.dtoModels.Entity import Entity
from app.models.dbEnums.RoleType import RoleType
from typing import Optional

class UserCompanyDTO(Entity):
    id: Optional[int] = None
    user_id: int
    company_id: Optional[int] = None
    workgroup_id: Optional[int] = None
    role: Optional[RoleType] = RoleType.PENDING
