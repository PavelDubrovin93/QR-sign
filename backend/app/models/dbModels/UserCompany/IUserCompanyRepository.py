from abc import ABC, abstractmethod
from typing import List, Optional

from app.models.dbModels.UserCompany.UserCompanyEntity import UserCompanyEntity


class IUserCompanyRepository(ABC):
    """
    Интерфейс репозитория для работы с промежуточной таблицей UserCompanyEntity.
    """

    @abstractmethod
    async def get_user_company_by_id(
        self, record_id: int
    ) -> Optional[UserCompanyEntity]:
        """
        Получить запись из промежуточной таблицы по идентификатору.
        :param record_id: ID записи
        :return: объект UserCompanyEntity или None
        """
        pass

    @abstractmethod
    async def get_user_companies_for_user(
        self, user_id: int
    ) -> List[UserCompanyEntity]:
        """
        Получить все записи промежуточной таблицы для указанного пользователя.
        :param user_id: ID пользователя
        :return: список объектов UserCompanyEntity
        """
        pass

    @abstractmethod
    async def create_user_company(self, uc_data: dict) -> UserCompanyEntity:
        """
        Создать новую запись в промежуточной таблице.
        :param uc_data: данные для записи
        :return: созданная запись
        """
        pass
