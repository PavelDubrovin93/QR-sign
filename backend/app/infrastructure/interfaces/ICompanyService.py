from abc import ABC, abstractmethod
from typing import Optional
from app.models.dtoModels.UserDTO import UserDTO
from app.models.dtoModels.UserCompanyDTO import UserCompanyDTO
from app.models.dtoModels.CompanyDTO import CompanyDTO
from app.api.validation.InviteConformResponse import InviteConformResponse



class ICompanyService(ABC):
    """
    Cервиса для работы с Company и UserCompany.
    """

    @abstractmethod
    async def create_new_company(self, user: UserDTO, company: CompanyDTO) -> Optional[CompanyDTO]:
        """
        Создать новую компанию и назначить текущего пользователя - админом.
        :param user: UserDTO, company: CompanyDTO
        :return: Объект CompanyDTO или None
        """
        pass

    @abstractmethod
    async def get_confirmation_info(self, uc_id: int) -> Optional[InviteConformResponse]:
        """
        Получить имя пользователя и название компаниию
        :param uc_id: int
        :return: Объект InviteConformResponse или None
        """

    @abstractmethod
    async def update_user_company_role(self, uc_id: int, new_role: str) -> Optional[UserCompanyDTO]:
        """
        обновить информацию по связи UserCompany.
        :param uc_data: UserCompanyDTO
        :return: Объект UserCompanyDTO или None
        """
        pass

    @abstractmethod
    async def delete_user_company(self, uc_id: int) -> None:
        """
        обновить информацию по связи UserCompany.
        :param uc_data: UserCompanyDTO
        :return: None
        """
        pass
