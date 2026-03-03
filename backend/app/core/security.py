"""
core/security.py
JWT token üretimi/doğrulaması ve şifre hash'leme.
Güvenlik açığı bırakmama prensibiyle yazıldı.
"""
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

settings = get_settings()

# bcrypt: endüstri standardı şifre hash algoritması
# rounds=12: brute-force'a karşı yeterli yavaşlık
_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


# ── Şifre İşlemleri ───────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    """Şifreyi bcrypt ile hash'le. Düz metin asla veritabanında saklanmaz."""
    return _pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """
    Timing-safe karşılaştırma — timing attack'a karşı korumalı.
    Doğru veya yanlış şifrede aynı süre geçer.
    """
    return _pwd_context.verify(plain, hashed)


# ── JWT Token İşlemleri ───────────────────────────────────────────────────────

def _create_token(data: dict[str, Any], expires_delta: timedelta) -> str:
    """
    JWT token oluştur.
    'exp' claim'i UTC timezone-aware olarak set edilir.
    """
    payload = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    payload.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_access_token(user_id: int, email: str) -> str:
    return _create_token(
        data={"sub": str(user_id), "email": email, "type": "access"},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )


def create_refresh_token(user_id: int) -> str:
    return _create_token(
        data={"sub": str(user_id), "type": "refresh"},
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Token'ı doğrula ve payload'ı döndür.
    Hatalı/süresi dolmuş token'da ValueError fırlatır.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "access":
            raise ValueError("Invalid token type")
        return payload
    except JWTError as exc:
        raise ValueError(f"Invalid token: {exc}") from exc
