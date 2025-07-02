from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import fastapi_get_db
from app.services.WorkGroupService import WorkGroupService
from app.services.TaskBoardService import TaskBoardService
from app.services.TaskPointService import TaskPointService
from app.validation.responses.WorkGroupResponse import CreateWorkGroupResponse, WorkGroupAndTaskboardResponse
from app.validation.responses.TaskBoardResponse import TaskBoardResponse, TaskPointResponse

from app.api.dependenices.user_dependecy import get_current_user
from typing import List
from app.validation.dtoModels.WorkGroupDTO import WorkGroupDTO

router = APIRouter()


@router.post("/create", response_model=WorkGroupDTO)
async def create_workgroup(
    workgroup_data: CreateWorkGroupResponse,
    session: AsyncSession = Depends(fastapi_get_db),
    user = Depends(get_current_user)
) -> WorkGroupDTO:
    service = WorkGroupService(session)
    workgroup = await service.create_workgroup(workgroup_data=workgroup_data)
    
    return workgroup


@router.get("/workgroups_by_company/{company_id}")
async def get_workgroups_by_company_id(
    company_id: int,
    session: AsyncSession = Depends(fastapi_get_db),
    user = Depends(get_current_user)
) -> List[WorkGroupDTO]:
    service = WorkGroupService(session)
    workgroups = await service.get_workgroups_by_company_id(company_id=company_id)
    
    return workgroups


@router.get("/workgroups_and_taskboards_by_company_id/{company_id}")
async def get_workgroups_and_taskboards_by_company_id(
    company_id: int,
    session: AsyncSession = Depends(fastapi_get_db),
    # user = Depends(get_current_user)
) -> List[WorkGroupAndTaskboardResponse]:
    service_wg = WorkGroupService(session)
    service_tb = TaskBoardService(session)
    service_tp = TaskPointService(session)
    workgroups = await service_wg.get_workgroups_by_company_id(company_id=company_id)
    
    ret_list = []

    for workgroup in workgroups:
        tb_list = []
        taskboards = await service_tb.get_taskboard_by_work_group_id(work_group_id=workgroup.id)
        
        for taskboard in taskboards:
            taskpoints = await service_tp.get_taskpoints_by_taskboard_id(taskboard_id=taskboard.id)
            tb_list.append(
                TaskBoardResponse(
                    id=taskboard.id,
                    title=taskboard.title,
                    company_id=taskboard.company_id,
                    work_group_id=taskboard.work_group_id,
                    image=taskboard.image,
                    location=taskboard.location,
                    type=taskboard.type,
                    description=taskboard.description or "",
                    done_at=taskboard.done_at,
                    task_points=[TaskPointResponse(
                            id=taskpoint.id,
                            title=taskpoint.title,
                            taskboard_id=taskpoint.taskboard_id,
                            description=taskpoint.description or "",
                            done_at=taskpoint.done_at,
                            issued_at=taskpoint.issued_at,
                            warning_at=taskpoint.warning_at,
                            thumbnails=taskpoint.thumbnails,
                            mark_icon=taskpoint.mark_icon,
                            coordinates=taskpoint.coordinates,
                            points=taskpoint.points,
                            qrcode=taskpoint.qrcode,
                            voice_message=taskpoint.voice_message

                            ) for taskpoint in taskpoints]
                )
            )
        
        users_in_workgroup = await service_wg.get_users_by_workgroup_id(workgroup_id=workgroup.id)
        
        ret_list.append(
            WorkGroupAndTaskboardResponse(
                taskboards=tb_list,
                users=users_in_workgroup,
                workgroup=workgroup
            )
        )
    
    return ret_list


@router.delete("/delete/{workgroup_id}")
async def delete_workgroup(
    workgroup_id: int,
    session: AsyncSession = Depends(fastapi_get_db),
    user = Depends(get_current_user)
) -> None:
    service = WorkGroupService(session)
    await service.delete_workgroup(workgroup_id=workgroup_id)
    
    return {"status": "ok"}


@router.put("")
async def edit_workgroup(
    workgroup_data: WorkGroupDTO,
    session: AsyncSession = Depends(fastapi_get_db),
    user = Depends(get_current_user)
) -> WorkGroupDTO:
    service = WorkGroupService(session)
    workgroup = await service.edit_workgroup(workgroup_data=workgroup_data)
    
    return workgroup


