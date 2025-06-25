from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.dtoModels.TaskPointDTO import TaskPointDTO
from app.infrastructure.db.session import fastapi_get_db 
from app.api.validation.NewTaskCountResponse import NewTaskCountResponse
from app.api.validation.UserCompanyResponse import UserCompanyResponse
from app.api.dependenices.user_dependecy import get_current_user
from app.services.UserDataService import UserDataService



router = APIRouter()

@router.get("/tasks", response_model=List[TaskPointDTO])
async def tasks_for_user(current_user=Depends(get_current_user), session: AsyncSession = Depends(fastapi_get_db)) -> List[TaskPointDTO]:
    service = UserDataService(session)
    tasks = await service.tasks_for_user(user=current_user)
    return tasks

@router.get("/amount_of_new_tasks", response_model=NewTaskCountResponse)
async def amount_of_new_tasks(current_user=Depends(get_current_user), session: AsyncSession = Depends(fastapi_get_db)) -> NewTaskCountResponse:
    service = UserDataService(session)
    count = await service.unviewed_tasks_count_for_user(user=current_user)
    return NewTaskCountResponse(count=count)

@router.get("/get_user_companies", response_model=List[UserCompanyResponse])
async def get_user_companies(current_user=Depends(get_current_user), session: AsyncSession = Depends(fastapi_get_db)) -> List[UserCompanyResponse]:
    service = UserDataService(session)
    companies = await service.companies_for_user(user=current_user)
    return companies
