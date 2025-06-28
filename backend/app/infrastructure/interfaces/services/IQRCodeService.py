from abc import ABC, abstractmethod
from typing import Optional

# from app.validation.dtoModels.TaskPointDTO import TaskPointDTO


class IQRCodeService(ABC):
    """
    Интерфейс сервиса для работы с QR-кодами.
    """

    @abstractmethod
    async def get_task_point_by_qr_code(self, qr_code_binary: bytes) -> Optional[int]:
        """
        Получить id задачи по бинарному представлению QR-кода.
        :param qr_code_binary: Бинарные данные QR-кода
        :return: Объект TaskPointDTO или None
        """
        pass
