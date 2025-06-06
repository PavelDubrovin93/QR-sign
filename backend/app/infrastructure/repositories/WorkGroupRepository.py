from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.dbModels.WorkGroup.IWorkGroupRepository import IWorkGroupRepository
from app.models.dbModels.WorkGroup.WorkGroupEntity import WorkGroupEntity as WorkGroup


class WorkGroupRepository(IWorkGroupRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_work_group_by_id(self, group_id: int) -> Optional[WorkGroup]:
        query = select(WorkGroup).where(WorkGroup.id == group_id)
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_work_groups_by_company(self, company_id: int) -> List[WorkGroup]:
        query = select(WorkGroup).where(WorkGroup.company_id == company_id)
        result = await self.session.execute(query)
        return result.scalars().all()

    async def create_work_group(self, wg_data: dict) -> WorkGroup:
        new_wg = WorkGroup(**wg_data)
        self.session.add(new_wg)
        await self.session.commit()
        await self.session.refresh(new_wg)
        return new_wg
