from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from app.core.auth import get_current_user, require_admin

router = APIRouter(prefix="/auth", tags=["auth"])


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserInfo(BaseModel):
    sub: str
    preferred_username: str
    email: str
    name: str
    realm_access: dict


@router.get("/me", response_model=UserInfo)
async def get_me(user: dict = Depends(get_current_user)):
    return UserInfo(
        sub=user.get("sub", ""),
        preferred_username=user.get("preferred_username", ""),
        email=user.get("email", ""),
        name=user.get("name", ""),
        realm_access=user.get("realm_access", {}),
    )


@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}


@router.get("/admin-only")
async def admin_only(user: dict = Depends(require_admin)):
    return {"message": "Admin access granted", "user": user.get("preferred_username")}
