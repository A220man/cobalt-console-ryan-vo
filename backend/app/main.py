from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1.windows import router as windows_router
from app.core.config import settings


def create_app() -> FastAPI:
    app = FastAPI(
        title="Cobalt Console",
        description="AI/ML developer tools for GPUI desktop applications",
        version="1.0.0",
        docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
        redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router, tags=["health"])
    app.include_router(windows_router, prefix="/api/v1", tags=["windows"])

    return app


app = create_app()