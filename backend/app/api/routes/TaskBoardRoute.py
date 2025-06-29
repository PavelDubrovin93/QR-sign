from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import fastapi_get_db
from app.services.TaskBoardService import TaskBoardService
from app.validation.dtoModels.TaskBoardDTO import TaskBoardDTO
from app.validation.responses.TaskBoardResponse import TaskBoardResponse, CreateTaskBoardResponse, EditTaskBoardResponse


from app.api.dependenices.user_dependecy import get_current_user

from typing import List


router = APIRouter()


@router.post("", response_model=TaskBoardResponse)
async def create_taskboard(
    taskboard_data: CreateTaskBoardResponse, session: AsyncSession = Depends(fastapi_get_db), user = Depends(get_current_user)
) -> TaskBoardResponse:

    service = TaskBoardService(session)
    task_board = await service.create_taskboard(taskboard_data=taskboard_data)

    return task_board


@router.get("/{taskboard_id}", response_model=TaskBoardResponse)
async def get_task_board_by_id(
    taskboard_id: int, session: AsyncSession = Depends(fastapi_get_db), user = Depends(get_current_user)
) -> TaskBoardDTO:
    
    service = TaskBoardService(session)
    task_board = await service.get_task_board_by_id(taskboard_id=taskboard_id)
    
    if task_board is None:
        raise HTTPException(status_code=404, detail="Task Board not found")

    return task_board


@router.get("/get_tasks_by_company/{company_id}", response_model=List[TaskBoardResponse])
async def get_task_boards_by_company_id(
    company_id: int, session: AsyncSession = Depends(fastapi_get_db), user = Depends(get_current_user)
) -> List[TaskBoardResponse]:
    
    service = TaskBoardService(session)
    task_boards = await service.get_task_boards_by_company_id_and_user_tg_id(company_id=company_id, user_tg_id=user.tg_id)
    
    return task_boards


@router.put("", response_model=TaskBoardResponse)
async def edit_task_board_with_task_points(
    taskboard_data: EditTaskBoardResponse, session: AsyncSession = Depends(fastapi_get_db), user = Depends(get_current_user)
) -> TaskBoardResponse:
    
    service = TaskBoardService(session)
    task_board = await service.edit_task_board_with_task_points(taskboard=taskboard_data)
    
    return task_board

@router.delete("/{taskboard_id}", response_model=TaskBoardResponse)
async def delete_task_board_and_task_points_by_tb_id(
    taskboard_id: int, session: AsyncSession = Depends(fastapi_get_db), user = Depends(get_current_user)
) -> TaskBoardResponse:
    
    service = TaskBoardService(session)
    status = await service.delete_task_board_and_task_points_by_tb_id(taskboard_id=taskboard_id)
    
    return status
