"""
repositories/base.py
Generic Repository Pattern — tüm CRUD işlemleri için temel sınıf.
Type-safe, async, injection-ready.
"""
from typing import Generic, TypeVar, Type, Any, Sequence
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import DeclarativeBase

ModelT = TypeVar("ModelT", bound=DeclarativeBase)


class BaseRepository(Generic[ModelT]):
    """
    Generic async repository.
    Alt sınıflar `model` class attribute'unu set etmeli.
    
    Kullanım:
        class NoteRepository(BaseRepository[Note]):
            model = Note
    """

    model: Type[ModelT]

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get(self, id: int) -> ModelT | None:
        return await self._session.get(self.model, id)

    async def get_or_raise(self, id: int) -> ModelT:
        obj = await self.get(id)
        if obj is None:
            raise ValueError(f"{self.model.__name__} id={id} bulunamadı")
        return obj

    async def list(
        self,
        *,
        filters: list[Any] | None = None,
        order_by: Any = None,
        limit: int | None = None,
        offset: int = 0,
    ) -> Sequence[ModelT]:
        stmt = select(self.model)
        if filters:
            stmt = stmt.where(*filters)
        if order_by is not None:
            stmt = stmt.order_by(order_by)
        if limit is not None:
            stmt = stmt.limit(limit).offset(offset)
        result = await self._session.execute(stmt)
        return result.scalars().all()

    async def count(self, *filters: Any) -> int:
        stmt = select(func.count()).select_from(self.model)
        if filters:
            stmt = stmt.where(*filters)
        result = await self._session.execute(stmt)
        return result.scalar_one()

    async def create(self, **kwargs: Any) -> ModelT:
        obj = self.model(**kwargs)
        self._session.add(obj)
        await self._session.flush()  # ID oluştur ama commit etme
        await self._session.refresh(obj)
        return obj

    async def update(self, obj: ModelT, **kwargs: Any) -> ModelT:
        for key, value in kwargs.items():
            if hasattr(obj, key):
                setattr(obj, key, value)
        await self._session.flush()
        await self._session.refresh(obj)
        return obj

    async def delete(self, obj: ModelT) -> None:
        await self._session.delete(obj)
        await self._session.flush()

    async def delete_by_id(self, id: int) -> bool:
        obj = await self.get(id)
        if obj is None:
            return False
        await self.delete(obj)
        return True
