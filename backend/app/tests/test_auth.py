"""Test authentication utilities."""
from typing import Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer(auto_error=False)

TEST_USER = {
    "sub": "test-user-id",
    "preferred_username": "testuser",
    "email": "test@example.com",
    "name": "Test User",
    "realm_access": {"roles": ["admin", "operator", "analyst"]},
}

TEST_TOKEN = "test-token"


async def get_test_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> Dict[str, Any]:
    if not credentials or credentials.credentials != TEST_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return TEST_USER
