from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.interfaces.services.IQRCodeService import \
    IQRCodeService
# from app.validation.dtoModels.TaskPointDTO import TaskPointDTO
from app.infrastructure.repositories.TaskPointRepository import \
    TaskPointRepository


class QRCodeService(IQRCodeService):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_task_point_by_qr_code(self, qr_code_binary: bytes) -> int:
        repo = TaskPointRepository(self.session)
        taskpoint = await repo.get_task_point_by_qr(qr_code_binary)
        return taskpoint.id if taskpoint else None
