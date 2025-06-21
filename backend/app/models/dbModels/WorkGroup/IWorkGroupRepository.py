from abc import ABC, abstractmethod
from typing import List, Optional

from app.models.dtoModels.WorkGroupDTO import WorkGroupDTO



class IWorkGroupRepository(ABC):
    """
    Интерфейс репозитория для работы с рабочими группами.
    """

    @abstractmethod
    async def get_work_group_by_id(self, group_id: int) -> Optional[WorkGroupDTO]:
        """
        Получить рабочую группу по идентификатору.
        :param group_id: ID группы
        :return: объект WorkGroup или None
        """
        pass

    @abstractmethod
    async def get_work_groups_by_company(self, company_id: int) -> List[WorkGroupDTO]:
        """
        Получить все рабочие группы для указанной компании.
        :param company_id: ID компании
        :return: список объектов WorkGroup
        """
        pass

    @abstractmethod
    async def create_work_group(self, wg_dto: WorkGroupDTO) -> WorkGroupDTO:
        """
        Создать новую рабочую группу.
        :param wg_data: данные группы
        :return: созданная группа
        """
        pass

    @abstractmethod
    async def delete_work_group_by_id(self, work_group_id: int) -> None:
        """
        Удаляет рабочую группу по id.
        :param work_group_id: ID рабочей группы
        """
        pass
