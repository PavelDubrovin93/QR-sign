from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.interfaces.services.IWorkGroupService import IWorkGroupService

from app.validation.dtoModels.WorkGroupDTO import WorkGroupDTO
from app.validation.responses.WorkGroupResponse import CreateWorkGroupResponse
from app.infrastructure.repositories.WorkGroupRepository import WorkGroupRepository

from typing import List


class WorkGroupService(IWorkGroupService):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_workgroup(self, workgroup_data: CreateWorkGroupResponse) -> WorkGroupDTO:
        repo = WorkGroupRepository(self.session)
        workgroup = await repo.create_work_group(
            wg_dto=workgroup_data
        )

        return workgroup
    

    async def get_workgroups_by_company_id(self, company_id: int) -> List[WorkGroupDTO]:
        repo = WorkGroupRepository(self.session)
        workgroups = await repo.get_work_groups_by_company(company_id=company_id)

        return workgroups

    async def delete_workgroup(self, workgroup_id: int) -> None:
        repo = WorkGroupRepository(self.session)
        await repo.delete_work_group_by_id(work_group_id=workgroup_id)

    async def edit_workgroup(self, workgroup_data: WorkGroupDTO) -> WorkGroupDTO:
        repo = WorkGroupRepository(self.session)
        workgroup = await repo.edit_work_group(
            wg_dto=workgroup_data
        )

        return workgroup