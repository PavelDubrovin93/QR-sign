from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.dtoModels.TaskPointDTO import TaskPointDTO
from app.infrastructure.db.session import fastapi_get_db 
from app.api.validation.NewTaskCountResponse import NewTaskCountResponse
from app.api.dependenices.user_dependecy import get_current_user
from app.services.UserDataService import UserDataService


router = APIRouter(prefix="/user_data")

@router.get("/tasks", response_model=List[TaskPointDTO])
async def tasks_for_user(user_id=Depends(get_current_user), session: AsyncSession = Depends(fastapi_get_db)) -> List[TaskPointDTO]:
    service = UserDataService(session)
    tasks = await service.tasks_for_user(user_id)
    return tasks

@router.get("/amount_of_new_tasks", response_model=NewTaskCountResponse)
async def amount_of_new_tasks(user_id=Depends(get_current_user), session: AsyncSession = Depends(fastapi_get_db)) -> NewTaskCountResponse:
    service = UserDataService(session)
    count = await service.unviewed_tasks_count_for_user(user_id=user_id)
    return NewTaskCountResponse(count=count)
