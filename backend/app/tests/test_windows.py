import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import create_app
from app.core.database import get_session
from app.core.auth import get_current_user
from app.tests.test_auth import get_test_user, TEST_TOKEN
from app.models.window import Window, WindowState, Base, WindowCreate
from app.services.window_service import WindowService


@pytest.fixture(scope="function")
def test_engine():
    """Create a fresh in-memory SQLite database for each test."""
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,
    )
    # Initialize schema synchronously
    import asyncio
    async def init():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    asyncio.run(init())
    return engine


@pytest.fixture(scope="function")
async def test_session(test_engine):
    """Create a fresh session for each test."""
    async_session = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session
    await test_engine.dispose()


@pytest.fixture(scope="function")
def client(test_engine):
    """Create a test client with overridden database dependency."""
    async def override_get_session():
        async_session = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)
        async with async_session() as session:
            yield session
    
    app = create_app()
    app.dependency_overrides[get_session] = override_get_session
    app.dependency_overrides[get_current_user] = get_test_user
    
    transport = ASGITransport(app=app)
    client = AsyncClient(transport=transport, base_url="http://test")
    client.headers.update({"Authorization": f"Bearer {TEST_TOKEN}"})
    return client


@pytest.fixture(scope="function")
def window_service(test_engine):
    """Create a WindowService with a fresh session."""
    async_session = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)
    session = async_session()
    return WindowService(session)


class TestWindowAPI:
    @pytest.mark.asyncio
    async def test_create_window(self, client: AsyncClient):
        response = await client.post("/api/v1/windows", json={"window_id": "test-window-create", "title": "Test Window"})
        assert response.status_code == 201
        data = response.json()
        assert data["window_id"] == "test-window-create"
        assert data["title"] == "Test Window"
        assert data["state"] == "visible"

    @pytest.mark.asyncio
    async def test_create_duplicate_window_fails(self, client: AsyncClient):
        await client.post("/api/v1/windows", json={"window_id": "dup", "title": "First"})
        response = await client.post("/api/v1/windows", json={"window_id": "dup", "title": "Second"})
        assert response.status_code == 409

    @pytest.mark.asyncio
    async def test_list_windows(self, client: AsyncClient):
        await client.post("/api/v1/windows", json={"window_id": "list-1", "title": "List 1"})
        await client.post("/api/v1/windows", json={"window_id": "list-2", "title": "List 2"})
        response = await client.get("/api/v1/windows")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 2
        assert len(data["windows"]) >= 2

    @pytest.mark.asyncio
    async def test_get_window(self, client: AsyncClient):
        await client.post("/api/v1/windows", json={"window_id": "get-1", "title": "Get Me"})
        response = await client.get("/api/v1/windows/get-1")
        assert response.status_code == 200
        data = response.json()
        assert data["window_id"] == "get-1"

    @pytest.mark.asyncio
    async def test_get_nonexistent_window(self, client: AsyncClient):
        response = await client.get("/api/v1/windows/nonexistent")
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_update_window(self, client: AsyncClient):
        await client.post("/api/v1/windows", json={"window_id": "update-1", "title": "Original"})
        response = await client.patch("/api/v1/windows/update-1", json={"title": "Updated"})
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated"

    @pytest.mark.asyncio
    async def test_hide_window(self, client: AsyncClient):
        await client.post("/api/v1/windows", json={"window_id": "hide-1", "title": "To Hide"})
        response = await client.post("/api/v1/windows/hide-1/hide")
        assert response.status_code == 200
        data = response.json()
        assert data["state"] == "hidden"

    @pytest.mark.asyncio
    async def test_show_window(self, client: AsyncClient):
        await client.post("/api/v1/windows", json={"window_id": "show-1", "title": "To Show"})
        await client.post("/api/v1/windows/show-1/hide")
        response = await client.post("/api/v1/windows/show-1/show")
        assert response.status_code == 200
        data = response.json()
        assert data["state"] == "visible"

    @pytest.mark.asyncio
    async def test_delete_window(self, client: AsyncClient):
        await client.post("/api/v1/windows", json={"window_id": "del-1", "title": "To Delete"})
        response = await client.delete("/api/v1/windows/del-1")
        assert response.status_code == 204
        get_response = await client.get("/api/v1/windows/del-1")
        assert get_response.status_code == 404


class TestWindowService:
    @pytest.mark.asyncio
    async def test_create_and_get(self, window_service: WindowService):
        window = await window_service.create_window(WindowCreate(
            window_id="svc-1", title="Service Window"
        ))
        assert window.window_id == "svc-1"
        assert window.title == "Service Window"
        
        fetched = await window_service.get_window("svc-1")
        assert fetched is not None
        assert fetched.window_id == "svc-1"

    @pytest.mark.asyncio
    async def test_hide_show_service(self, window_service: WindowService):
        await window_service.create_window(WindowCreate(
            window_id="svc-2", title="Hide Show"
        ))
        hidden = await window_service.hide_window("svc-2")
        assert hidden is not None
        assert hidden.state == WindowState.HIDDEN
        
        shown = await window_service.show_window("svc-2")
        assert shown is not None
        assert shown.state == WindowState.VISIBLE
