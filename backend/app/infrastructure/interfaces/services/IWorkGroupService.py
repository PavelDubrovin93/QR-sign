from abc import ABC, abstractmethod
from typing import Optional

from app.validation.dtoModels.WorkGroupDTO import WorkGroupDTO
from app.validation.responses.WorkGroupResponse import CreateWorkGroupResponse


class IWorkGroupService(ABC):
    """
    Интерфейс сервиса для работы с QR-кодами.
    """

    @abstractmethod
    async def create_workgroup(self, workgroup_data: CreateWorkGroupResponse) -> WorkGroupDTO:
        """
        Создает воркгруппу
        """
        pass
