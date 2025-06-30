from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import fastapi_get_db
from app.services.WorkGroupService import WorkGroupService
from app.validation.responses.WorkGroupResponse import CreateWorkGroupResponse
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


