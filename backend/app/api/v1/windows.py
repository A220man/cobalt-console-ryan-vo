from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.database import get_session
from app.models.window import (
    WindowCreate,
    WindowUpdate,
    WindowResponse,
    WindowListResponse,
    WindowState,
)
from app.services.window_service import WindowService

router = APIRouter()


def get_window_service(session: AsyncSession = Depends(get_session)) -> WindowService:
    return WindowService(session)


@router.post("/windows", response_model=WindowResponse, status_code=status.HTTP_201_CREATED)
async def create_window(
    window_data: WindowCreate,
    service: WindowService = Depends(get_window_service),
    user: dict = Depends(get_current_user),
) -> WindowResponse:
    existing = await service.get_window(window_data.window_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Window with id '{window_data.window_id}' already exists",
        )
    return await service.create_window(window_data)


@router.get("/windows", response_model=WindowListResponse)
async def list_windows(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service: WindowService = Depends(get_window_service),
    user: dict = Depends(get_current_user),
) -> WindowListResponse:
    return await service.list_windows(page=page, page_size=page_size)


@router.get("/windows/{window_id}", response_model=WindowResponse)
async def get_window(
    window_id: str,
    service: WindowService = Depends(get_window_service),
    user: dict = Depends(get_current_user),
) -> WindowResponse:
    window = await service.get_window(window_id)
    if not window:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Window not found")
    return window


@router.patch("/windows/{window_id}", response_model=WindowResponse)
async def update_window(
    window_id: str,
    window_data: WindowUpdate,
    service: WindowService = Depends(get_window_service),
    user: dict = Depends(get_current_user),
) -> WindowResponse:
    window = await service.update_window(window_id, window_data)
    if not window:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Window not found")
    return window


@router.post("/windows/{window_id}/hide", response_model=WindowResponse)
async def hide_window(
    window_id: str,
    service: WindowService = Depends(get_window_service),
    user: dict = Depends(get_current_user),
) -> WindowResponse:
    window = await service.hide_window(window_id)
    if not window:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Window not found")
    return window


@router.post("/windows/{window_id}/show", response_model=WindowResponse)
async def show_window(
    window_id: str,
    service: WindowService = Depends(get_window_service),
    user: dict = Depends(get_current_user),
) -> WindowResponse:
    window = await service.show_window(window_id)
    if not window:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Window not found")
    return window


@router.delete("/windows/{window_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_window(
    window_id: str,
    service: WindowService = Depends(get_window_service),
    user: dict = Depends(get_current_user),
) -> None:
    deleted = await service.delete_window(window_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Window not found")
