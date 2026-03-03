"""
middleware/security.py
Güvenlik middleware katmanı:
- JWT authentication dependency
- Rate limiting (IP bazlı)
- Security headers (OWASP önerilerine uygun)
- Request size limiti
"""
import time
import logging
from collections import defaultdict
from typing import Annotated

from fastapi import Depends, HTTPException, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_access_token
from app.core.config import get_settings
from app.repositories import UserRepository
from app.models.user import User

logger = logging.getLogger(__name__)
settings = get_settings()
_bearer = HTTPBearer(auto_error=True)

# ── JWT Authentication ────────────────────────────────────────────────────────

async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(_bearer)],
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    FastAPI dependency — korumalı endpoint'lere inject edilir.
    Geçersiz/süresi dolmuş token'da 401 döndürür.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Oturum süresi dolmuş, tekrar giriş yapın",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = int(payload["sub"])
    except (ValueError, KeyError, TypeError):
        raise credentials_exception

    repo = UserRepository(db)
    user = await repo.get(user_id)
    if user is None or not user.is_active:
        raise credentials_exception

    return user


# Convenience type alias — router'larda kullanmak için
CurrentUser = Annotated[User, Depends(get_current_user)]


# ── Rate Limiter ──────────────────────────────────────────────────────────────

class _TokenBucket:
    """
    Token Bucket algoritması — bellek içi rate limiter.
    Üretim ortamında Redis ile değiştir: slowapi + Redis backend.
    """
    def __init__(self, rate: int, per_seconds: int = 60):
        self._rate = rate
        self._per = per_seconds
        self._buckets: dict[str, tuple[float, float]] = {}  # ip → (tokens, last_refill)

    def is_allowed(self, key: str) -> bool:
        now = time.monotonic()
        tokens, last = self._buckets.get(key, (float(self._rate), now))
        elapsed = now - last
        tokens = min(float(self._rate), tokens + elapsed * (self._rate / self._per))
        if tokens >= 1:
            self._buckets[key] = (tokens - 1, now)
            return True
        self._buckets[key] = (tokens, now)
        return False


_default_limiter = _TokenBucket(rate=settings.RATE_LIMIT_PER_MINUTE)
_auth_limiter = _TokenBucket(rate=settings.RATE_LIMIT_AUTH_PER_MINUTE)


def rate_limit(limiter: _TokenBucket = _default_limiter):
    """Rate limit dependency factory."""
    async def _check(request: Request):
        ip = request.client.host if request.client else "unknown"
        if not limiter.is_allowed(ip):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Çok fazla istek gönderildi, lütfen bekleyin",
                headers={"Retry-After": "60"},
            )
    return _check


auth_rate_limit = rate_limit(_auth_limiter)
default_rate_limit = rate_limit(_default_limiter)


# ── Security Headers Middleware ───────────────────────────────────────────────

async def security_headers_middleware(request: Request, call_next) -> Response:
    """
    OWASP önerilen güvenlik header'ları.
    XSS, clickjacking, MIME sniffing saldırılarını önler.
    """
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    if not settings.DEBUG:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response
