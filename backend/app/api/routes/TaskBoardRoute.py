from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import fastapi_get_db
from app.services.TaskBoardService import TaskBoardService
from app.validation.dtoModels.TaskBoardDTO import TaskBoardDTO
from app.validation.responses.TaskBoardResponse import TaskBoardResponse

router = APIRouter()


@router.get("/{taskboard_id}", response_model=TaskBoardResponse)
async def get_task_board_by_id(
    taskboard_id: int, session: AsyncSession = Depends(fastapi_get_db)
) -> TaskBoardDTO:
    
    service = TaskBoardService(session)
    task_board = await service.get_task_board_by_id(taskboard_id)
    
    if task_board is None:
        raise HTTPException(status_code=404, detail="Task Board not found")

    return task_board


@router.put("", response_model=TaskBoardResponse)
async def edit_task_board_with_task_points(
    taskboard_data: TaskBoardResponse, session: AsyncSession = Depends(fastapi_get_db)
) -> TaskBoardResponse:
    
    service = TaskBoardService(session)
    task_board = await service.edit_task_board_with_task_points(taskboard_data)
    
    return task_board

@router.delete("/{taskboard_id}", response_model=TaskBoardResponse)
async def delete_task_board_and_task_points_by_tb_id(
    taskboard_id: int, session: AsyncSession = Depends(fastapi_get_db)
) -> TaskBoardResponse:
    
    service = TaskBoardService(session)
    status = await service.delete_task_board_and_task_points_by_tb_id(taskboard_id)
    
    return status
