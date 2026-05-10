"""
core/database.py
Async veritabanı bağlantısı — Singleton pattern.
SQLite'dan PostgreSQL'e geçiş sadece DATABASE_URL değişikliğiyle olur.
"""
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    AsyncEngine,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import event
from typing import AsyncGenerator

from app.core.config import get_settings

settings = get_settings()

# ── Engine (Singleton) ────────────────────────────────────────────────────────
_engine: AsyncEngine | None = None


def _get_engine() -> AsyncEngine:
    global _engine
    if _engine is None:
        kwargs: dict = {
            "echo": settings.DEBUG,  # SQL sorgularını logla (sadece dev'de)
        }
        # SQLite özel ayarları
        if "sqlite" in settings.DATABASE_URL:
            kwargs["connect_args"] = {"check_same_thread": False}

        _engine = create_async_engine(settings.DATABASE_URL, **kwargs)

        # SQLite için WAL modu: performansı artırır, eşzamanlı okuma sağlar
        if "sqlite" in settings.DATABASE_URL:
            @event.listens_for(_engine.sync_engine, "connect")
            def set_sqlite_pragma(dbapi_conn, _):
                cursor = dbapi_conn.cursor()
                cursor.execute("PRAGMA journal_mode=WAL")
                cursor.execute("PRAGMA foreign_keys=ON")
                cursor.execute("PRAGMA synchronous=NORMAL")
                cursor.close()

    return _engine


# ── Session Factory ───────────────────────────────────────────────────────────
_session_factory: async_sessionmaker | None = None


def _get_session_factory() -> async_sessionmaker:
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(
            bind=_get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,  # Commit sonrası nesne erişilebilir kalsın
            autocommit=False,
            autoflush=False,
        )
    return _session_factory


# ── Base Model ────────────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    """Tüm SQLAlchemy modelleri bu sınıftan türetilir."""
    pass


# ── Dependency Injection (FastAPI) ────────────────────────────────────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Her HTTP isteği için yeni session açar, bitince kapatır.
    Django'nun ORM transaction yönetimine karşılık gelir.
    """
    factory = _get_session_factory()
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ── Lifecycle ─────────────────────────────────────────────────────────────────
async def init_db() -> None:
    """Uygulama başlangıcında tabloları oluştur."""
    engine = _get_engine()
    async with engine.begin() as conn:
        # Import burada yapılır — circular import önleme
        from app.models import note, task, session as study_session, goal, user  # noqa
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """Uygulama kapanırken bağlantıları temizle."""
    global _engine, _session_factory
    if _engine:
        await _engine.dispose()
        _engine = None
        _session_factory = None
