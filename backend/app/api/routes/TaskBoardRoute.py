from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.validation.TaskBoardResponse import TaskBoardResponse

from app.models.dtoModels.TaskBoardDTO import TaskBoardDTO
from app.infrastructure.db.session import fastapi_get_db
from app.services.TaskBoardService import TaskBoardService

router = APIRouter()

@router.get("/{taskboard_id}", response_model=TaskBoardResponse)
async def get_task_board_by_id(taskboard_id: int, session: AsyncSession = Depends(fastapi_get_db)) -> TaskBoardDTO:
    service = TaskBoardService(session)
    task_board = await service.get_task_board_by_id(taskboard_id)
    if task_board is None:
        raise HTTPException(status_code=404, detail="Task Board not found")
    return task_board