from abc import ABC, abstractmethod
from typing import List, Optional

from app.models.dbModels.Company.CompanyEntity import CompanyEntity


class ICompanyRepository(ABC):
    """
    Интерфейс репозитория для работы с компаниями.
    """

    @abstractmethod
    async def get_company_by_id(self, company_id: int) -> Optional[CompanyEntity]:
        """
        Получить компанию по идентификатору.
        :param company_id: ID компании
        :return: объект CompanyEntity или None
        """
        pass

    @abstractmethod
    async def get_companies(self) -> List[CompanyEntity]:
        """
        Получить список всех компаний.
        :return: список объектов CompanyEntity
        """
        pass

    @abstractmethod
    async def create_company(self, company_data: dict) -> CompanyEntity:
        """
        Создать новую компанию.
        :param company_data: данные компании
        :return: созданная компания
        """
        pass
