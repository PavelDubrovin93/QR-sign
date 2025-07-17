from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.interfaces.services.IWorkGroupService import \
    IWorkGroupService
from app.infrastructure.repositories.UserCompanyRepository import \
    UserCompanyRepository
from app.infrastructure.repositories.UserRepository import UserRepository
from app.infrastructure.repositories.WorkGroupRepository import \
    WorkGroupRepository
from app.validation.dtoModels.WorkGroupDTO import WorkGroupDTO
from app.validation.responses.WorkGroupResponse import (
    CreateWorkGroupResponse, UserAndUC)


class WorkGroupService(IWorkGroupService):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_workgroup(
        self, workgroup_data: CreateWorkGroupResponse
    ) -> WorkGroupDTO:
        repo = WorkGroupRepository(self.session)
        workgroup = await repo.create_work_group(wg_dto=workgroup_data)

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
        workgroup = await repo.edit_work_group(wg_dto=workgroup_data)

        return workgroup

    async def get_users_by_workgroup_id(self, workgroup_id: int) -> List[UserAndUC]:
        repo_uc = UserCompanyRepository(self.session)
        repo_users = UserRepository(self.session)
        user_companies = await repo_uc.get_all_uc_in_company_by_workgroup_id(
            workgroup_id=workgroup_id
        )

        ret_list = []

        for uc in user_companies:
            user = await repo_users.get_user_by_id(uc.user_id)
            if user is not None:
                ret_list.append(UserAndUC(user=user, uc=uc))

        return ret_list
