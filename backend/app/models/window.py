from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field
from sqlalchemy import Column, DateTime, Enum as SQLEnum, Integer, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class WindowState(str, Enum):
    VISIBLE = "visible"
    HIDDEN = "hidden"
    MINIMIZED = "minimized"
    MAXIMIZED = "maximized"


class Window(Base):
    __tablename__ = "windows"

    id = Column(Integer, primary_key=True, index=True)
    window_id = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    state = Column(SQLEnum(WindowState), default=WindowState.VISIBLE, nullable=False)
    x = Column(Integer, default=0)
    y = Column(Integer, default=0)
    width = Column(Integer, default=800)
    height = Column(Integer, default=600)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class WindowCreate(BaseModel):
    window_id: str = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=1, max_length=255)
    x: int = Field(default=0, ge=-10000)
    y: int = Field(default=0, ge=-10000)
    width: int = Field(default=800, ge=100, le=10000)
    height: int = Field(default=600, ge=100, le=10000)


class WindowUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    state: Optional[WindowState] = None
    x: Optional[int] = Field(default=None, ge=-10000)
    y: Optional[int] = Field(default=None, ge=-10000)
    width: Optional[int] = Field(default=None, ge=100, le=10000)
    height: Optional[int] = Field(default=None, ge=100, le=10000)


class WindowResponse(BaseModel):
    id: int
    window_id: str
    title: str
    state: WindowState
    x: int
    y: int
    width: int
    height: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WindowListResponse(BaseModel):
    windows: list[WindowResponse]
    total: int
    page: int
    page_size: int