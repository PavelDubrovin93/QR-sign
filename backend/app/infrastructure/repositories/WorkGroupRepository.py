from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.dbModels.WorkGroup.IWorkGroupRepository import IWorkGroupRepository
from app.models.dbModels.WorkGroup.WorkGroupEntity import WorkGroupEntity as WorkGroup
from app.models.dtoModels.WorkGroupDTO import WorkGroupDTO



class WorkGroupRepository(IWorkGroupRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_work_group_by_id(self, group_id: int) -> Optional[WorkGroupDTO]:
        query = select(WorkGroup).where(WorkGroup.id == group_id)
        result = await self.session.execute(query)
        workgroup = result.scalars().first()
        return workgroup.to_dto()

    async def get_work_groups_by_company(self, company_id: int) -> List[WorkGroupDTO]:
        query = select(WorkGroup).where(WorkGroup.company_id == company_id)
        result = await self.session.execute(query)
        workgroups = result.scalars().all()
        return [workgroup.to_dto() for workgroup in workgroups]

    async def create_work_group(self, wg_dto: WorkGroupDTO) -> WorkGroup:
        new_wg = WorkGroup(
            title=wg_dto.title,
            description=wg_dto.description,
            company_id=wg_dto.company_id
        )
        self.session.add(new_wg)
        await self.session.commit()
        await self.session.refresh(new_wg)
        return new_wg.to_dto()

    async def delete_work_group_by_id(self, work_group_id: int) -> None:
        query = select(WorkGroup).where(WorkGroup.id == work_group_id)
        result = await self.session.execute(query)
        work_group_to_delete = result.scalars().first()
        if work_group_to_delete is None:
            raise ValueError(f"Пользователь с id {work_group_id} не существует.")
        await self.session.delete(work_group_to_delete)
        await self.session.commit()

    async def __to_dto(self, workgroup: WorkGroup) -> WorkGroupDTO:
        return WorkGroupDTO(
            id=workgroup.id,
            title=workgroup.title,
            description=workgroup.description,
            company_id=workgroup.company_id
        )
