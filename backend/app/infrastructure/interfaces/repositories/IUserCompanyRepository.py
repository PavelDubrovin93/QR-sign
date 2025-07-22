from abc import ABC, abstractmethod
from typing import List, Optional

from app.validation.dtoModels.UserCompanyDTO import UserCompanyDTO


class IUserCompanyRepository(ABC):
    """
    Интерфейс репозитория для работы с промежуточной таблицей UserCompanyEntity.
    """

    @abstractmethod
    async def get_user_company_by_id(self, record_id: int) -> Optional[UserCompanyDTO]:
        """
        Получить запись из промежуточной таблицы по идентификатору.
        :param record_id: ID записи
        :return: объект UserCompanyEntity или None
        """
        pass

    @abstractmethod
    async def get_user_companies_for_user(self, user_id: int) -> List[UserCompanyDTO]:
        """
        Получить все записи промежуточной таблицы для указанного пользователя.
        :param user_id: ID пользователя
        :return: список объектов UserCompanyEntity
        """
        pass

    @abstractmethod
    async def create_user_company(self, uc_data: UserCompanyDTO) -> UserCompanyDTO:
        """
        Создать новую запись в промежуточной таблице.
        :param uc_data: данные для записи
        :return: созданная запись
        """
        pass

    @abstractmethod
    async def delete_user_company_by_id(self, user_company_id: int) -> None:
        """
        Удаляет запись UC по id.
        :param user_company_id: ID записи UC
        """
        pass

    @abstractmethod
    async def get_all_users_in_company_with_company_id(
        self, company_id: int
    ) -> List[UserCompanyDTO]:
        pass

    @abstractmethod
    async def get_user_company_by_company_id_and_user_id(
        self, company_id: int, user_id: int
    ) -> Optional[UserCompanyDTO]:
        pass

    @abstractmethod
    async def get_user_companies_by_company_id_and_user_id(
        self, company_id: int, user_id: int
    ) -> List[UserCompanyDTO]:
        """
        Получить ВСЕ записи UserCompany для пользователя в указанной компании.
        :param company_id: ID компании
        :param user_id: ID пользователя
        :return: список всех записей UserCompanyDTO для пользователя в компании
        """
        pass
