from app.models.dtoModels.Entity import Entity

class UserCompanyDTO(Entity):
    id: int
    user_id: int
    company_id: int
    workgroup_id: int
    role: str
