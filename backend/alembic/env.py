# alembic/env.py
"""
Alembic — Django'nun makemigrations/migrate'ine karşılık gelir.
Veritabanı şema değişikliklerini sürüm kontrolünde tutar.

Komutlar:
  alembic revision --autogenerate -m "add user table"  → Migration oluştur
  alembic upgrade head                                  → Tüm migration'ları uygula
  alembic downgrade -1                                  → Bir adım geri al
"""
import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

from app.core.config import get_settings
from app.core.database import Base

# Tüm model'leri import et — autogenerate için gerekli
from app.models.user import User          # noqa: F401
from app.models.note import Note, Folder  # noqa: F401
from app.models.task import Task          # noqa: F401
from app.models.session import StudySession  # noqa: F401
from app.models.goal import Goal, Badge   # noqa: F401

settings = get_settings()
config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
