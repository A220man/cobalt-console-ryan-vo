from typing import Optional, Dict, Any
from functools import lru_cache

import httpx
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import settings


security = HTTPBearer(auto_error=False)


class KeycloakAuth:
    def __init__(self):
        self._jwks: Optional[Dict[str, Any]] = None
        self._jwks_url = f"{settings.KEYCLOAK_URL}/realms/{settings.KEYCLOAK_REALM}/protocol/openid-connect/certs"
        self._issuer = f"{settings.KEYCLOAK_URL}/realms/{settings.KEYCLOAK_REALM}"

    async def get_jwks(self) -> Dict[str, Any]:
        if self._jwks is None:
            async with httpx.AsyncClient() as client:
                response = await client.get(self._jwks_url, timeout=10.0)
                response.raise_for_status()
                self._jwks = response.json()
        return self._jwks

    def get_signing_key(self, kid: str) -> Optional[str]:
        if not self._jwks:
            return None
        for key in self._jwks.get("keys", []):
            if key.get("kid") == kid:
                return jwt.algorithms.RSAAlgorithm.from_jwk(key)
        return None

    async def verify_token(self, token: str) -> Dict[str, Any]:
        try:
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get("kid")
            if not kid:
                raise JWTError("No kid in token header")

            signing_key = self.get_signing_key(kid)
            if not signing_key:
                await self.get_jwks()
                signing_key = self.get_signing_key(kid)
                if not signing_key:
                    raise JWTError(f"Unable to find signing key for kid: {kid}")

            payload = jwt.decode(
                token,
                signing_key,
                algorithms=["RS256"],
                audience=settings.KEYCLOAK_CLIENT_ID,
                issuer=self._issuer,
                options={"verify_aud": True, "verify_iss": True, "verify_exp": True},
            )
            return payload
        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )


@lru_cache
def get_keycloak_auth() -> KeycloakAuth:
    return KeycloakAuth()


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    auth: KeycloakAuth = Depends(get_keycloak_auth),
) -> Dict[str, Any]:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return await auth.verify_token(credentials.credentials)


def require_role(required_role: str):
    async def role_checker(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        realm_access = user.get("realm_access", {})
        roles = realm_access.get("roles", [])
        if required_role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Required role: {required_role}",
            )
        return user
    return role_checker


require_admin = require_role("admin")
require_operator = require_role("operator")
require_analyst = require_role("analyst")
