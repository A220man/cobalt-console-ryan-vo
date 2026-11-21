from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, and_

from app.core.database import get_session
from app.models.window import WindowCreate, WindowListResponse, WindowResponse, WindowUpdate, KeyboardState, TextInputInfo
from app.services.window_service import WindowService

router = APIRouter()


def get_window_service(session: AsyncSession = Depends(get_session)) -> WindowService:
    return WindowService(session)


@router.post("/windows", response_model=WindowResponse, status_code=status.HTTP_201_CREATED)
async def create_window(
    window_data: WindowCreate,
    service: WindowService = Depends(get_window_service),
) -> WindowResponse:
    existing = await service.get_window(window_data.window_id)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Window ID already exists")
    return await service.create_window(window_data)


@router.get("/windows", response_model=WindowListResponse)
async def list_windows(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service: WindowService = Depends(get_window_service),
) -> WindowListResponse:
    return await service.list_windows(page=page, page_size=page_size)


@router.get("/windows/{window_id}", response_model=WindowResponse)
async def get_window(
    window_id: str,
    service: WindowService = Depends(get_window_service),
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
) -> WindowResponse:
    window = await service.update_window(window_id, window_data)
    if not window:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Window not found")
    return window


@router.post("/windows/{window_id}/hide", response_model=WindowResponse)
async def hide_window(
    window_id: str,
    service: WindowService = Depends(get_window_service),
) -> WindowResponse:
    window = await service.hide_window(window_id)
    if not window:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Window not found")
    return window


@router.post("/windows/{window_id}/show", response_model=WindowResponse)
async def show_window(
    window_id: str,
    service: WindowService = Depends(get_window_service),
) -> WindowResponse:
    window = await service.show_window(window_id)
    if not window:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Window not found")
    return window


@router.post("/windows/{window_id}/minimize", response_model=WindowResponse)
async def minimize_window(
    window_id: str,
    service: WindowService = Depends(get_window_service),
) -> WindowResponse:
    window = await service.minimize_window(window_id)
    if not window:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Window not found")
    return window


@router.post("/windows/{window_id}/maximize", response_model=WindowResponse)
async def maximize_window(
    window_id: str,
    service: WindowService = Depends(get_window_service),
) -> WindowResponse:
    window = await service.maximize_window(window_id)
    if not window:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Window not found")
    return window


@router.post("/windows/{window_id}/restore", response_model=WindowResponse)
async def restore_window(
    window_id: str,
    service: WindowService = Depends(get_window_service),
) -> WindowResponse:
    window = await service.restore_window(window_id)
    if not window:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Window not found")
    return window


@router.delete("/windows/{window_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_window(
    window_id: str,
    service: WindowService = Depends(get_window_service),
) -> None:
    deleted = await service.delete_window(window_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Window not found")


# Keyboard status endpoint for mobile touch support
class KeyboardStatusRequest(BaseModel):
    input_id: str = Field(..., min_length=1)
    is_focused: bool = False
    keyboard_state: KeyboardState = KeyboardState.UNKNOWN


class KeyboardStatusResponse(BaseModel):
    input_id: str
    is_focused: bool
    keyboard_state: KeyboardState


@router.post("/windows/{window_id}/keyboard/status", response_model=KeyboardStatusResponse)
async def set_keyboard_status(
    window_id: str,
    keyboard_data: KeyboardStatusRequest,
    service: WindowService = Depends(get_window_service),
) -> KeyboardStatusResponse:
    """Set keyboard visibility state for mobile text input handling."""
    result = await service.session.execute(
        select(TextInputInfo).where(
            and_(TextInputInfo.window_id == window_id, TextInputInfo.input_id == keyboard_data.input_id)
        )
    )
    text_input = result.scalar_one_or_none()

    if text_input:
        text_input.is_focused = keyboard_data.is_focused
        text_input.keyboard_state = keyboard_data.keyboard_state
        text_input.last_updated = func.now()
    else:
        text_input = TextInputInfo(
            window_id=window_id,
            input_id=keyboard_data.input_id,
            is_focused=keyboard_data.is_focused,
            keyboard_state=keyboard_data.keyboard_state,
        )
        service.session.add(text_input)

    await service.session.commit()
    await service.session.refresh(text_input)

    return KeyboardStatusResponse(
        input_id=text_input.input_id,
        is_focused=text_input.is_focused,
        keyboard_state=text_input.keyboard_state,
    )


@router.get("/windows/{window_id}/keyboard/status", response_model=KeyboardStatusResponse)
async def get_keyboard_status(
    window_id: str,
    input_id: str = Query(..., min_length=1),
    service: WindowService = Depends(get_window_service),
) -> KeyboardStatusResponse:
    """Get keyboard visibility state for mobile text input handling."""
    result = await service.session.execute(
        select(TextInputInfo).where(
            and_(TextInputInfo.window_id == window_id, TextInputInfo.input_id == input_id)
        )
    )
    text_input = result.scalar_one_or_none()

    if not text_input:
        return KeyboardStatusResponse(
            input_id=input_id,
            is_focused=False,
            keyboard_state=KeyboardState.UNKNOWN,
        )

    return KeyboardStatusResponse(
        input_id=text_input.input_id,
        is_focused=text_input.is_focused,
        keyboard_state=text_input.keyboard_state,
    )
