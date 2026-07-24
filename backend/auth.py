"""
auth.py — JWT issuance, validation, and role-enforcement dependencies.

Token strategy: short-lived access token (60 min) + in-memory blocklist for
logout. No refresh token needed for this single-server deployment; swap to
Redis-backed blocklist if scaling horizontally.
"""

import os
import time
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

try:
    import jwt as pyjwt
except ImportError:
    raise ImportError("PyJWT is required: pip install PyJWT")

SECRET_KEY = os.getenv("JWT_SECRET", "idbi-lending-secret-change-in-prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

# In-memory blocklist — stores jti (JWT ID) of invalidated tokens.
# Entries expire automatically after ACCESS_TOKEN_EXPIRE_MINUTES so the set
# doesn't grow unbounded.
_blocklist: dict[str, float] = {}  # jti -> expiry epoch


def _purge_expired():
    now = time.time()
    expired = [k for k, v in _blocklist.items() if v < now]
    for k in expired:
        del _blocklist[k]


def create_access_token(payload: dict) -> str:
    """Issue a signed JWT. payload must include 'sub' (employee_id) and 'role'."""
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    jti = f"{payload['sub']}-{int(now.timestamp())}"
    data = {**payload, "iat": now, "exp": exp, "jti": jti}
    return pyjwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


def invalidate_token(token: str) -> None:
    """Add token's jti to blocklist (logout)."""
    try:
        decoded = pyjwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        jti = decoded.get("jti")
        exp = decoded.get("exp", 0)
        if jti:
            _purge_expired()
            _blocklist[jti] = exp
    except Exception:
        pass  # already invalid — nothing to do


def _decode_token(token: str) -> dict:
    try:
        decoded = pyjwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired — please log in again")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    jti = decoded.get("jti")
    if jti and jti in _blocklist:
        raise HTTPException(status_code=401, detail="Token has been invalidated — please log in again")
    return decoded


_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> dict:
    """FastAPI dependency — returns decoded token payload or raises 401."""
    token = None
    if credentials:
        token = credentials.credentials
    else:
        # Also accept token from cookie (future-proofing)
        token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")
    return _decode_token(token)


def require_roles(*roles: str):
    """Returns a dependency that enforces the caller has one of the given roles."""
    def _dep(current_user: dict = Depends(get_current_user)) -> dict:
        if current_user.get("role") not in roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied — required role: {' or '.join(roles)}",
            )
        return current_user
    return _dep


# Convenience role dependencies
require_admin = require_roles("admin")
require_bm_or_admin = require_roles("bm", "admin")
require_any = get_current_user  # any authenticated user
