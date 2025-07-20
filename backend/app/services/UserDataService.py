from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.interfaces.services.IUserDataService import \
    IUserDataService
from app.infrastructure.repositories.CompanyRepository import CompanyRepository
from app.infrastructure.repositories.TaskBoardRepository import \
    TaskBoardRepository
from app.infrastructure.repositories.TaskPointRepository import \
    TaskPointRepository
from app.infrastructure.repositories.UserCompanyRepository import \
    UserCompanyRepository
from app.validation.dtoModels.UserDTO import UserDTO
from app.validation.responses.TaskBoardResponse import TaskBoardResponse
from app.validation.responses.UserCompanyResponse import UserCompanyResponse


class UserDataService(IUserDataService):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def tasks_for_user(self, user: UserDTO) -> List[TaskBoardResponse]:
        if user.id is None:
            return []
        
        user_id = user.id
        tp_repo = TaskPointRepository(self.session)
        tb_repo = TaskBoardRepository(self.session)
        tasks = await tp_repo.get_task_point_by_user_id(user_id)
        boards_map = {}
        for point in tasks:
            board_id = point.taskboard_id
            if board_id not in boards_map:
                taskboard = await tb_repo.get_task_board_by_id(board_id)
                if taskboard is not None:
                    boards_map[board_id] = TaskBoardResponse(
                        id=taskboard.id,
                        title=taskboard.title,
                        company_id=taskboard.company_id,
                        work_group_id=taskboard.work_group_id,
                        image=taskboard.image,
                        location=taskboard.location,
                        type=taskboard.type,
                        description=taskboard.description or "",
                        done_at=taskboard.done_at,
                        created_by=taskboard.created_by,
                        admin_id=taskboard.admin_id,
                    )
            if board_id in boards_map:
                boards_map[board_id].task_points.append(point)
        responses = list(boards_map.values())
        return responses

    async def unviewed_tasks_count_for_user(self, user: UserDTO) -> int:
        if user.id is None:
            return 0
            
        user_id = user.id
        tp_repo = TaskPointRepository(self.session)
        tasks = await tp_repo.get_task_point_by_user_id(user_id)
        unviewed_task_count = [tp for tp in tasks if tp.issued_at is None]
        return len(unviewed_task_count)

    async def companies_for_user(self, user: UserDTO) -> List[UserCompanyResponse]:
        if user.id is None:
            return []
            
        user_id = user.id
        company_repo = CompanyRepository(self.session)
        uc_repo = UserCompanyRepository(self.session)
        uc_list = await uc_repo.get_user_companies_for_user(user_id=user_id)
        responses = []
        for uc in uc_list:
            if uc.company_id is not None:
                company_id = uc.company_id
                company = await company_repo.get_company_by_id(company_id)
                if company is not None and company.id is not None and uc.role is not None:
                    responses.append(
                        UserCompanyResponse(
                            company_id=company.id, company_name=company.title, role=str(uc.role.value)
                        )
                    )
        return responses

    async def get_user_role(self, user_id: int, company_id: int) -> str:
        uc_repo = UserCompanyRepository(self.session)
        uc = await uc_repo.get_user_company_by_company_id_and_user_id(
            company_id=company_id, user_id=user_id
        )
        if uc is None or uc.role is None:
            raise ValueError(f"User {user_id} not found in company {company_id} or has no role")
        return str(uc.role.value)
