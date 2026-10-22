import pytest
from httpx import AsyncClient, ASGITransport

from app.main import create_app


@pytest.fixture
def client():
    app = create_app()
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


class TestHealthEndpoints:
    @pytest.mark.asyncio
    async def test_health_check(self, client: AsyncClient):
        async with client as ac:
            response = await ac.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "cobalt-console"

    @pytest.mark.asyncio
    async def test_readiness_check(self, client: AsyncClient):
        async with client as ac:
            response = await ac.get("/health/ready")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ready"
        assert data["service"] == "cobalt-console"