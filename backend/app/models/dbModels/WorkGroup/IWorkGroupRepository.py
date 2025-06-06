from abc import ABC, abstractmethod
from typing import List, Optional

from app.models.dbModels.WorkGroup.WorkGroupEntity import WorkGroupEntity as WorkGroup


class IWorkGroupRepository(ABC):
    """
    Интерфейс репозитория для работы с рабочими группами.
    """

    @abstractmethod
    async def get_work_group_by_id(self, group_id: int) -> Optional[WorkGroup]:
        """
        Получить рабочую группу по идентификатору.
        :param group_id: ID группы
        :return: объект WorkGroup или None
        """
        pass

    @abstractmethod
    async def get_work_groups_for_company(self, company_id: int) -> List[WorkGroup]:
        """
        Получить все рабочие группы для указанной компании.
        :param company_id: ID компании
        :return: список объектов WorkGroup
        """
        pass

    @abstractmethod
    async def create_work_group(self, wg_data: dict) -> WorkGroup:
        """
        Создать новую рабочую группу.
        :param wg_data: данные группы
        :return: созданная группа
        """
        pass
