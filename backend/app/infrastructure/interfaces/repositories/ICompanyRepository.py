from abc import ABC, abstractmethod
from typing import List, Optional

from app.validation.dtoModels.CompanyDTO import CompanyDTO


class ICompanyRepository(ABC):
    """
    Интерфейс репозитория для работы с компаниями.
    """

    @abstractmethod
    async def get_company_by_id(self, company_id: int) -> Optional[CompanyDTO]:
        """
        Получить компанию по идентификатору.
        :param company_id: ID компании
        :return: объект CompanyDTO или None
        """
        pass

    @abstractmethod
    async def get_companies(self) -> List[CompanyDTO]:
        """
        Получить список всех компаний.
        :return: список объектов CompanyDTO
        """
        pass

    @abstractmethod
    async def create_company(self, company_data: CompanyDTO) -> CompanyDTO:
        """
        Создать новую компанию.
        :param company_data: данные компании
        :return: созданная компания
        """
        pass

    @abstractmethod
    async def delete_company_by_id(self, company_id: int) -> None:
        """
        Удалить компанию по id.
        :param company_id: ID компании
        """
        pass
