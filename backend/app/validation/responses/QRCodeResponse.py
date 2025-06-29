from typing import List, Optional
from app.validation.Entity import Entity


class QRCodeResponse(Entity):
    task_board_ids: Optional[List[int]]