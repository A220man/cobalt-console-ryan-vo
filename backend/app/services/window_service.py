from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.window import Window, WindowState, WindowCreate, WindowUpdate, WindowResponse, WindowListResponse


class WindowService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_window(self, window_data: WindowCreate) -> WindowResponse:
        window = Window(**window_data.model_dump())
        self.session.add(window)
        await self.session.commit()
        await self.session.refresh(window)
        return WindowResponse.model_validate(window)

    async def get_window(self, window_id: str) -> Optional[WindowResponse]:
        result = await self.session.execute(select(Window).where(Window.window_id == window_id))
        window = result.scalar_one_or_none()
        return WindowResponse.model_validate(window) if window else None

    async def get_window_by_id(self, id: int) -> Optional[WindowResponse]:
        result = await self.session.execute(select(Window).where(Window.id == id))
        window = result.scalar_one_or_none()
        return WindowResponse.model_validate(window) if window else None

    async def list_windows(self, page: int = 1, page_size: int = 20) -> WindowListResponse:
        offset = (page - 1) * page_size
        total_result = await self.session.execute(select(func.count(Window.id)))
        total = total_result.scalar_one()

        result = await self.session.execute(
            select(Window).offset(offset).limit(page_size).order_by(Window.created_at.desc())
        )
        windows = [WindowResponse.model_validate(w) for w in result.scalars().all()]

        return WindowListResponse(
            windows=windows,
            total=total,
            page=page,
            page_size=page_size,
        )

    async def update_window(self, window_id: str, window_data: WindowUpdate) -> Optional[WindowResponse]:
        result = await self.session.execute(select(Window).where(Window.window_id == window_id))
        window = result.scalar_one_or_none()
        if not window:
            return None

        update_data = window_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(window, field, value)

        await self.session.commit()
        await self.session.refresh(window)
        return WindowResponse.model_validate(window)

    async def hide_window(self, window_id: str) -> Optional[WindowResponse]:
        return await self.update_window(window_id, WindowUpdate(state=WindowState.HIDDEN))

    async def show_window(self, window_id: str) -> Optional[WindowResponse]:
        return await self.update_window(window_id, WindowUpdate(state=WindowState.VISIBLE))

    async def delete_window(self, window_id: str) -> bool:
        result = await self.session.execute(select(Window).where(Window.window_id == window_id))
        window = result.scalar_one_or_none()
        if not window:
            return False

        await self.session.delete(window)
        await self.session.commit()
        return True