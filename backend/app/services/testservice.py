from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.repositories.UISettingsRepository import UISettingsRepository

# Import your repositories and entities
from app.infrastructure.repositories.UserRepository import UserRepository
from app.models.dbModels.User.UserEntity import UserEntity as User


async def test_service(session: AsyncSession) -> Any:
    repo_user = UserRepository(session)
    repo_ui = UISettingsRepository(session)

    user = User(tg_id=608124825, name="test")

    data = await repo_user.add_user(new_user=user)

    return data


from app.infrastructure.repositories.TaskPointRepository import TaskPointRepository
from app.models.dbModels.TaskPoint.TaskPointEntity import TaskPointEntity as TaskPoint


async def create_tp(session: AsyncSession) -> Any:
    repo_task_point = TaskPointRepository(session)

    task_point = TaskPoint(
        title="title", taskboard_id=4,
        thumbnails="thumbnails", mark_icon="mark_icon", coordinates=[1, 1],
        qrcode="qrcode".encode('utf-8')
    )

    data = await repo_task_point.add_task_point(new_task_point=task_point)

    return data



from app.infrastructure.repositories.TaskBoardRepository import TaskBoardRepository
from app.models.dbModels.TaskBoard.TaskBoardEntity import TaskBoardEntity as TaskBoard


async def create_tb(session: AsyncSession) -> Any:
    repo_task_board = TaskBoardRepository(session)

    task_board = TaskBoard(
        title="title",
        company_id=1,
        image="default_image.jpg",
        work_group_id=1,
        location=[1, 1],
        type="type",
        description="description",
    )

    data = await repo_task_board.add_task_board(new_task_board=task_board)

    return data


from app.infrastructure.repositories.WorkGroupRepository import WorkGroupRepository
from app.models.dbModels.WorkGroup.WorkGroupEntity import WorkGroupEntity as WorkGroup


async def create_wg(session: AsyncSession) -> Any:
    repo_work_group = WorkGroupRepository(session)

    # work_group = WorkGroup(title="title", description="description", company_id=1)
    work_group = {
        "title": "title", "description": "description", "company_id": 1
    }

    data = await repo_work_group.create_work_group(wg_data=work_group)

    return data



from app.infrastructure.repositories.CompanyRepository import CompanyRepository
from app.models.dbModels.Company.CompanyEntity import CompanyEntity as Company


async def create_company(session: AsyncSession) -> Any:
    repo_company = CompanyRepository(session)

    # company = Company(title="company", subscription_type="personnel")
    new_company_data = {
        "title": "company", "subscription_type": "personnel"
    }

    data = await repo_company.create_company(company_data=new_company_data)

    return data 