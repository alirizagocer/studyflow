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

_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker | None = None


def _get_engine() -> AsyncEngine:
    global _engine
    if _engine is None:
        kwargs: dict = {"echo": settings.DEBUG}
        if "sqlite" in settings.DATABASE_URL:
            kwargs["connect_args"] = {"check_same_thread": False}
        _engine = create_async_engine(settings.DATABASE_URL, **kwargs)
        if "sqlite" in settings.DATABASE_URL:
            @event.listens_for(_engine.sync_engine, "connect")
            def set_sqlite_pragma(dbapi_conn, _):
                cursor = dbapi_conn.cursor()
                cursor.execute("PRAGMA journal_mode=WAL")
                cursor.execute("PRAGMA foreign_keys=ON")
                cursor.execute("PRAGMA synchronous=NORMAL")
                cursor.close()
    return _engine


def _get_session_factory() -> async_sessionmaker:
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(
            bind=_get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )
    return _session_factory


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
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


async def init_db() -> None:
    engine = _get_engine()
    async with engine.begin() as conn:
        from app.models import note, task, session as study_session, goal, user  # noqa
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    global _engine, _session_factory
    if _engine:
        await _engine.dispose()
        _engine = None
        _session_factory = None