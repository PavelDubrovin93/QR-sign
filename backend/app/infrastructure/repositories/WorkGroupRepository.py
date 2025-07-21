from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.infrastructure.interfaces.repositories.IWorkGroupRepository import \
    IWorkGroupRepository
from app.models.dbModels.WorkGroup.WorkGroupEntity import \
    WorkGroupEntity as WorkGroup
from app.validation.dtoModels.WorkGroupDTO import WorkGroupDTO
from app.validation.responses.WorkGroupResponse import CreateWorkGroupResponse


class WorkGroupRepository(IWorkGroupRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_work_group_by_id(self, group_id: int) -> Optional[WorkGroupDTO]:
        query = select(WorkGroup).where(WorkGroup.id == group_id)
        result = await self.session.execute(query)
        workgroup = result.scalar_one_or_none()
        workgroup_dto = await self.__to_dto(workgroup) if workgroup else None
        return workgroup_dto

    async def get_work_groups_by_company(self, company_id: int) -> List[WorkGroupDTO]:
        query = select(WorkGroup).where(WorkGroup.company_id == company_id)
        result = await self.session.execute(query)
        workgroups = result.scalars().all()
        workgroups_dto = [await self.__to_dto(workgroup) for workgroup in workgroups]
        return workgroups_dto
    
    async def get_work_groups_by_admin(self, admin_id: int) -> List[WorkGroupDTO]:
        query = select(WorkGroup).where(WorkGroup.admin_id == admin_id)
        result = await self.session.execute(query)
        workgroups = result.scalars().all()
        workgroups_dto = [await self.__to_dto(workgroup) for workgroup in workgroups]
        return workgroups_dto

    async def edit_work_group(self, workgroup: WorkGroupDTO) -> WorkGroupDTO:
        query = select(WorkGroup).where(WorkGroup.id == workgroup.id)
        result = await self.session.execute(query)
        workgroup_to_edit = result.scalar_one_or_none()
        if workgroup_to_edit is None:
            raise ValueError(f"запись с id {workgroup.id} не существует.")
        workgroup_to_edit.title = workgroup.title
        workgroup_to_edit.description = workgroup.description
        await self.session.commit()
        await self.session.refresh(workgroup_to_edit)
        workgroup_dto = await self.__to_dto(workgroup_to_edit)

        return workgroup_dto

    async def create_work_group(self, wg_dto: CreateWorkGroupResponse) -> WorkGroupDTO:
        new_wg = WorkGroup(
            title=wg_dto.title,
            description=wg_dto.description,
            company_id=wg_dto.company_id,
        )
        self.session.add(new_wg)
        await self.session.commit()
        await self.session.refresh(new_wg)
        workgroup_dto = await self.__to_dto(new_wg) if new_wg else None
        return workgroup_dto

    async def delete_work_group_by_id(self, work_group_id: int) -> None:
        query = select(WorkGroup).where(WorkGroup.id == work_group_id)
        result = await self.session.execute(query)
        work_group_to_delete = result.scalars().first()
        if work_group_to_delete is None:
            raise ValueError(f"Воркгруппа с id {work_group_id} не существует.")
        await self.session.delete(work_group_to_delete)
        await self.session.commit()

    async def __to_dto(self, workgroup: WorkGroup) -> WorkGroupDTO:
        return WorkGroupDTO(
            id=workgroup.id,
            title=workgroup.title,
            description=workgroup.description,
            company_id=workgroup.company_id,
        )
