"""
repositories/note.py
repositories/task.py
repositories/session.py
repositories/goal.py
repositories/user.py
"""
from datetime import date, datetime, timedelta, timezone
from typing import Sequence
from sqlalchemy import select, and_, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.note import Note, Folder, note_links
from app.models.task import Task
from app.models.session import StudySession
from app.models.goal import Goal, Badge
from app.models.user import User
from app.repositories.base import BaseRepository


# ── User Repository ───────────────────────────────────────────────────────────

class UserRepository(BaseRepository[User]):
    model = User

    async def get_by_email(self, email: str) -> User | None:
        result = await self._session.execute(
            select(User).where(User.email == email.lower())
        )
        return result.scalar_one_or_none()

    async def email_exists(self, email: str) -> bool:
        count = await self.count(User.email == email.lower())
        return count > 0


# ── Folder Repository ─────────────────────────────────────────────────────────

class FolderRepository(BaseRepository[Folder]):
    model = Folder

    async def get_tree(self, owner_id: int) -> Sequence[Folder]:
        """Kullanıcının tüm klasörlerini döndür (tree oluşturma frontend'de)."""
        result = await self._session.execute(
            select(Folder)
            .where(Folder.owner_id == owner_id)
            .order_by(Folder.name)
        )
        return result.scalars().all()

    async def get_user_folder(self, folder_id: int, owner_id: int) -> Folder | None:
        result = await self._session.execute(
            select(Folder).where(
                and_(Folder.id == folder_id, Folder.owner_id == owner_id)
            )
        )
        return result.scalar_one_or_none()


# ── Note Repository ───────────────────────────────────────────────────────────

class NoteRepository(BaseRepository[Note]):
    model = Note

    async def get_with_links(self, note_id: int, owner_id: int) -> Note | None:
        result = await self._session.execute(
            select(Note)
            .where(and_(Note.id == note_id, Note.owner_id == owner_id))
            .options(selectinload(Note.linked_notes))
        )
        return result.scalar_one_or_none()

    async def list_by_folder(self, folder_id: int, owner_id: int) -> Sequence[Note]:
        result = await self._session.execute(
            select(Note)
            .where(and_(Note.folder_id == folder_id, Note.owner_id == owner_id))
            .order_by(Note.updated_at.desc())
        )
        return result.scalars().all()

    async def search(self, owner_id: int, query: str) -> Sequence[Note]:
        """Basit full-text arama. PostgreSQL'de trigram index ile optimize edilebilir."""
        pattern = f"%{query}%"
        result = await self._session.execute(
            select(Note).where(
                and_(
                    Note.owner_id == owner_id,
                    (Note.title.ilike(pattern) | Note.content.ilike(pattern)),
                )
            ).order_by(Note.updated_at.desc()).limit(50)
        )
        return result.scalars().all()

    async def add_time(self, note_id: int, seconds: int) -> None:
        note = await self.get(note_id)
        if note:
            note.time_spent = (note.time_spent or 0) + seconds
            note.revision_count = (note.revision_count or 0) + 1
            await self._session.flush()


# ── Task Repository ───────────────────────────────────────────────────────────

class TaskRepository(BaseRepository[Task]):
    model = Task

    async def list_by_date(self, owner_id: int, day: date) -> Sequence[Task]:
        result = await self._session.execute(
            select(Task)
            .where(and_(Task.owner_id == owner_id, Task.scheduled_date == day))
            .order_by(Task.scheduled_time.asc().nullslast())
        )
        return result.scalars().all()

    async def list_range(self, owner_id: int, start: date, end: date) -> Sequence[Task]:
        result = await self._session.execute(
            select(Task)
            .where(
                and_(
                    Task.owner_id == owner_id,
                    Task.scheduled_date >= start,
                    Task.scheduled_date <= end,
                )
            )
            .order_by(Task.scheduled_date, Task.scheduled_time.asc().nullslast())
        )
        return result.scalars().all()

    async def get_by_uid(self, uid: str) -> Task | None:
        result = await self._session.execute(
            select(Task).where(Task.calendar_uid == uid)
        )
        return result.scalar_one_or_none()

    async def get_user_task(self, task_id: int, owner_id: int) -> Task | None:
        result = await self._session.execute(
            select(Task).where(and_(Task.id == task_id, Task.owner_id == owner_id))
        )
        return result.scalar_one_or_none()


# ── Session Repository ────────────────────────────────────────────────────────

class SessionRepository(BaseRepository[StudySession]):
    model = StudySession

    async def get_active(self, owner_id: int) -> StudySession | None:
        result = await self._session.execute(
            select(StudySession).where(
                and_(
                    StudySession.owner_id == owner_id,
                    StudySession.status == "active",
                )
            )
        )
        return result.scalar_one_or_none()

    async def list_by_date_range(
        self, owner_id: int, start: date, end: date
    ) -> Sequence[StudySession]:
        start_dt = datetime.combine(start, datetime.min.time())
        end_dt = datetime.combine(end, datetime.max.time())
        result = await self._session.execute(
            select(StudySession)
            .where(
                and_(
                    StudySession.owner_id == owner_id,
                    StudySession.started_at >= start_dt,
                    StudySession.started_at <= end_dt,
                    StudySession.status == "completed",
                )
            )
            .order_by(StudySession.started_at.desc())
        )
        return result.scalars().all()

    async def total_seconds_range(self, owner_id: int, start: date, end: date) -> int:
        start_dt = datetime.combine(start, datetime.min.time())
        end_dt = datetime.combine(end, datetime.max.time())
        result = await self._session.execute(
            select(func.sum(StudySession.duration_seconds)).where(
                and_(
                    StudySession.owner_id == owner_id,
                    StudySession.started_at >= start_dt,
                    StudySession.started_at <= end_dt,
                    StudySession.status == "completed",
                )
            )
        )
        return result.scalar_one() or 0


# ── Goal Repository ───────────────────────────────────────────────────────────

class GoalRepository(BaseRepository[Goal]):
    model = Goal

    async def list_active(self, owner_id: int) -> Sequence[Goal]:
        result = await self._session.execute(
            select(Goal)
            .where(and_(Goal.owner_id == owner_id, Goal.is_active == True))  # noqa: E712
            .order_by(Goal.created_at.desc())
        )
        return result.scalars().all()


class BadgeRepository(BaseRepository[Badge]):
    model = Badge

    async def has_badge(self, owner_id: int, code: str) -> bool:
        count = await self.count(
            Badge.owner_id == owner_id,
            Badge.badge_code == code,
        )
        return count > 0

    async def list_user_badges(self, owner_id: int) -> Sequence[Badge]:
        result = await self._session.execute(
            select(Badge)
            .where(Badge.owner_id == owner_id)
            .order_by(Badge.earned_at.desc())
        )
        return result.scalars().all()
