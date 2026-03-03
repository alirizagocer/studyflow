"""
services/auth.py
services/note.py
services/task.py
services/session.py
services/stats.py
services/goal.py

Service Layer — tüm iş mantığı burada.
Router sadece HTTP çevirir, asıl iş service'de olur.
"""
from datetime import date, datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories import (
    UserRepository, FolderRepository, NoteRepository,
    TaskRepository, SessionRepository, GoalRepository, BadgeRepository,
)
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.core.events import event_bus, Event, EventType
from app.schemas import (
    UserRegister, UserLogin, TokenOut, UserOut,
    FolderCreate, FolderUpdate, FolderOut,
    NoteCreate, NoteUpdate, NoteOut,
    TaskCreate, TaskUpdate, TaskOut,
    SessionStart, SessionEnd, SessionOut,
    GoalCreate, GoalOut,
    WeeklyStats, DayStats, SubjectStats,
)
from app.models.goal import Badge


# ── Auth Service ──────────────────────────────────────────────────────────────

class AuthService:
    def __init__(self, session: AsyncSession):
        self._users = UserRepository(session)

    async def register(self, data: UserRegister) -> TokenOut:
        if await self._users.email_exists(data.email):
            raise ValueError("Bu e-posta adresi zaten kayıtlı")

        user = await self._users.create(
            email=data.email.lower(),
            display_name=data.display_name,
            hashed_password=hash_password(data.password),
        )
        return TokenOut(
            access_token=create_access_token(user.id, user.email),
            refresh_token=create_refresh_token(user.id),
        )

    async def login(self, data: UserLogin) -> TokenOut:
        user = await self._users.get_by_email(data.email)
        if user is None or not verify_password(data.password, user.hashed_password):
            # Aynı hata mesajı — hangi alanın yanlış olduğunu belli etme
            raise ValueError("E-posta veya şifre hatalı")
        if not user.is_active:
            raise ValueError("Hesap deaktif edilmiş")

        return TokenOut(
            access_token=create_access_token(user.id, user.email),
            refresh_token=create_refresh_token(user.id),
        )


# ── Folder Service ────────────────────────────────────────────────────────────

class FolderService:
    def __init__(self, session: AsyncSession):
        self._folders = FolderRepository(session)

    async def create(self, owner_id: int, data: FolderCreate) -> FolderOut:
        # Üst klasör varsa sahipliğini kontrol et
        if data.parent_id:
            parent = await self._folders.get_user_folder(data.parent_id, owner_id)
            if parent is None:
                raise ValueError("Üst klasör bulunamadı")

        folder = await self._folders.create(
            name=data.name,
            owner_id=owner_id,
            parent_id=data.parent_id,
        )
        return FolderOut.model_validate(folder)

    async def get_tree(self, owner_id: int) -> list[dict]:
        folders = await self._folders.get_tree(owner_id)
        # Tree oluştur — O(n) algoritma
        folder_map: dict[int, dict] = {}
        for f in folders:
            folder_map[f.id] = {
                "id": f.id, "name": f.name, "parent_id": f.parent_id,
                "note_count": 0, "created_at": f.created_at, "children": []
            }
        roots = []
        for fid, fdata in folder_map.items():
            pid = fdata["parent_id"]
            if pid and pid in folder_map:
                folder_map[pid]["children"].append(fdata)
            else:
                roots.append(fdata)
        return roots

    async def rename(self, folder_id: int, owner_id: int, data: FolderUpdate) -> FolderOut:
        folder = await self._folders.get_user_folder(folder_id, owner_id)
        if folder is None:
            raise ValueError("Klasör bulunamadı")
        folder = await self._folders.update(folder, name=data.name)
        return FolderOut.model_validate(folder)

    async def delete(self, folder_id: int, owner_id: int) -> None:
        folder = await self._folders.get_user_folder(folder_id, owner_id)
        if folder is None:
            raise ValueError("Klasör bulunamadı")
        await self._folders.delete(folder)


# ── Note Service ──────────────────────────────────────────────────────────────

class NoteService:
    def __init__(self, session: AsyncSession):
        self._notes = NoteRepository(session)
        self._folders = FolderRepository(session)

    async def create(self, owner_id: int, data: NoteCreate) -> NoteOut:
        # Klasörün sahibini doğrula
        folder = await self._folders.get_user_folder(data.folder_id, owner_id)
        if folder is None:
            raise ValueError("Klasör bulunamadı")

        note = await self._notes.create(
            title=data.title,
            content=data.content,
            folder_id=data.folder_id,
            owner_id=owner_id,
        )
        note.tags = data.tags  # property setter kullan

        await event_bus.publish(Event(
            type=EventType.NOTE_CREATED,
            user_id=owner_id,
            payload={"note_id": note.id},
        ))
        return self._to_out(note)

    async def update(self, note_id: int, owner_id: int, data: NoteUpdate) -> NoteOut:
        note = await self._notes.get_with_links(note_id, owner_id)
        if note is None:
            raise ValueError("Not bulunamadı")

        updates: dict = {}
        if data.title is not None:
            updates["title"] = data.title
        if data.content is not None:
            updates["content"] = data.content
        if data.folder_id is not None:
            updates["folder_id"] = data.folder_id

        note = await self._notes.update(note, **updates)
        if data.tags is not None:
            note.tags = data.tags
        note.revision_count += 1

        await event_bus.publish(Event(
            type=EventType.NOTE_UPDATED,
            user_id=owner_id,
            payload={"note_id": note.id},
        ))
        return self._to_out(note)

    async def get(self, note_id: int, owner_id: int) -> NoteOut:
        note = await self._notes.get_with_links(note_id, owner_id)
        if note is None:
            raise ValueError("Not bulunamadı")
        return self._to_out(note)

    async def list_by_folder(self, folder_id: int, owner_id: int) -> list[NoteOut]:
        notes = await self._notes.list_by_folder(folder_id, owner_id)
        return [self._to_out(n) for n in notes]

    async def search(self, owner_id: int, query: str) -> list[NoteOut]:
        if len(query.strip()) < 2:
            return []
        notes = await self._notes.search(owner_id, query)
        return [self._to_out(n) for n in notes]

    async def delete(self, note_id: int, owner_id: int) -> None:
        note = await self._notes.get_with_links(note_id, owner_id)
        if note is None:
            raise ValueError("Not bulunamadı")
        await self._notes.delete(note)

    def _to_out(self, note) -> NoteOut:
        linked_ids = [n.id for n in (note.linked_notes or [])]
        return NoteOut(
            id=note.id, title=note.title, content=note.content,
            folder_id=note.folder_id, tags=note.tags,
            time_spent=note.time_spent, revision_count=note.revision_count,
            created_at=note.created_at, updated_at=note.updated_at,
            linked_note_ids=linked_ids,
        )


# ── Task Service ──────────────────────────────────────────────────────────────

class TaskService:
    def __init__(self, session: AsyncSession):
        self._tasks = TaskRepository(session)

    async def create(self, owner_id: int, data: TaskCreate) -> TaskOut:
        task = await self._tasks.create(
            title=data.title, description=data.description,
            owner_id=owner_id, note_id=data.note_id,
            scheduled_date=data.scheduled_date, scheduled_time=data.scheduled_time,
            duration_minutes=data.duration_minutes,
        )
        return TaskOut.model_validate(task)

    async def list_today(self, owner_id: int) -> list[TaskOut]:
        tasks = await self._tasks.list_by_date(owner_id, date.today())
        return [TaskOut.model_validate(t) for t in tasks]

    async def list_range(self, owner_id: int, start: date, end: date) -> list[TaskOut]:
        if (end - start).days > 90:
            raise ValueError("En fazla 90 günlük aralık sorgulanabilir")
        tasks = await self._tasks.list_range(owner_id, start, end)
        return [TaskOut.model_validate(t) for t in tasks]

    async def complete(self, task_id: int, owner_id: int, actual_minutes: int = 0) -> TaskOut:
        task = await self._tasks.get_user_task(task_id, owner_id)
        if task is None:
            raise ValueError("Görev bulunamadı")
        task = await self._tasks.update(task, is_completed=True, actual_minutes=actual_minutes)
        await event_bus.publish(Event(
            type=EventType.TASK_COMPLETED,
            user_id=owner_id,
            payload={"task_id": task.id},
        ))
        return TaskOut.model_validate(task)

    async def update(self, task_id: int, owner_id: int, data: TaskUpdate) -> TaskOut:
        task = await self._tasks.get_user_task(task_id, owner_id)
        if task is None:
            raise ValueError("Görev bulunamadı")
        updates = {k: v for k, v in data.model_dump(exclude_none=True).items()}
        task = await self._tasks.update(task, **updates)
        return TaskOut.model_validate(task)

    async def delete(self, task_id: int, owner_id: int) -> None:
        task = await self._tasks.get_user_task(task_id, owner_id)
        if task is None:
            raise ValueError("Görev bulunamadı")
        await self._tasks.delete(task)


# ── Session Service ───────────────────────────────────────────────────────────

class SessionService:
    def __init__(self, session: AsyncSession):
        self._sessions = SessionRepository(session)
        self._notes = NoteRepository(session)

    async def start(self, owner_id: int, data: SessionStart) -> SessionOut:
        # Aktif seans varsa hata ver
        existing = await self._sessions.get_active(owner_id)
        if existing:
            raise ValueError("Zaten aktif bir çalışma seansı var")

        s = await self._sessions.create(
            owner_id=owner_id,
            note_id=data.note_id,
            task_id=data.task_id,
            started_at=datetime.now(timezone.utc),
            status="active",
        )
        await event_bus.publish(Event(EventType.SESSION_STARTED, owner_id, {"session_id": s.id}))
        return SessionOut.model_validate(s)

    async def end(self, owner_id: int, data: SessionEnd) -> SessionOut:
        s = await self._sessions.get_active(owner_id)
        if s is None:
            raise ValueError("Aktif seans bulunamadı")

        now = datetime.now(timezone.utc)
        duration = int((now - s.started_at.replace(tzinfo=timezone.utc)).total_seconds())
        pomodoros = duration // (25 * 60)

        s = await self._sessions.update(
            s,
            ended_at=now,
            duration_seconds=duration,
            pomodoro_count=pomodoros,
            status="completed",
            quick_notes=data.quick_notes,
        )

        # Not'un çalışma süresini güncelle
        if s.note_id:
            await self._notes.add_time(s.note_id, duration)

        await event_bus.publish(Event(
            EventType.SESSION_ENDED, owner_id,
            {"session_id": s.id, "duration": duration, "note_id": s.note_id},
        ))
        return SessionOut.model_validate(s)


# ── Stats Service ─────────────────────────────────────────────────────────────

class StatsService:
    def __init__(self, session: AsyncSession):
        self._sessions = SessionRepository(session)
        self._tasks = TaskRepository(session)

    async def weekly(self, owner_id: int, week_start: date) -> WeeklyStats:
        week_end = week_start + timedelta(days=6)
        all_sessions = await self._sessions.list_by_date_range(owner_id, week_start, week_end)

        # Günlük istatistikler
        daily_map: dict[date, DayStats] = {}
        for s in all_sessions:
            d = s.started_at.date()
            if d not in daily_map:
                daily_map[d] = DayStats(date=d, total_seconds=0, session_count=0, pomodoro_count=0)
            daily_map[d].total_seconds += s.duration_seconds
            daily_map[d].session_count += 1
            daily_map[d].pomodoro_count += s.pomodoro_count

        daily = [daily_map.get(week_start + timedelta(days=i),
                               DayStats(date=week_start + timedelta(days=i), total_seconds=0, session_count=0, pomodoro_count=0))
                 for i in range(7)]

        total_seconds = sum(s.duration_seconds for s in all_sessions)

        # Streak hesaplama
        streak = await self._calculate_streak(owner_id)

        return WeeklyStats(
            week_start=week_start,
            total_seconds=total_seconds,
            daily=daily,
            by_subject=[],  # Basitleştirme — üretimde note join yapılır
            streak_days=streak,
        )

    async def _calculate_streak(self, owner_id: int) -> int:
        """Ardışık çalışma günlerini say."""
        today = date.today()
        streak = 0
        check_date = today
        for _ in range(365):  # Max 365 gün bak
            seconds = await self._sessions.total_seconds_range(owner_id, check_date, check_date)
            if seconds > 0:
                streak += 1
                check_date -= timedelta(days=1)
            else:
                break
        return streak


# ── Goal Service ──────────────────────────────────────────────────────────────

class GoalService:
    def __init__(self, session: AsyncSession):
        self._goals = GoalRepository(session)
        self._badges = BadgeRepository(session)
        self._stats = StatsService(session)

    async def create(self, owner_id: int, data: GoalCreate) -> GoalOut:
        goal = await self._goals.create(
            owner_id=owner_id, title=data.title,
            goal_type=data.goal_type, target=data.target,
            deadline=data.deadline,
        )
        return GoalOut.model_validate(goal)

    async def list_active(self, owner_id: int) -> list[GoalOut]:
        goals = await self._goals.list_active(owner_id)
        return [GoalOut.model_validate(g) for g in goals]

    async def check_and_award_badges(self, owner_id: int) -> list[str]:
        """
        Kural tabanlı rozet sistemi — Observer pattern ile SESSION_ENDED'e subscribe.
        Kazanılan yeni rozet kodlarını döndürür.
        """
        earned: list[str] = []
        streak = await self._stats._calculate_streak(owner_id)

        badge_rules = [
            ("streak_7", streak >= 7),
            ("streak_30", streak >= 30),
        ]

        for code, condition in badge_rules:
            if condition and not await self._badges.has_badge(owner_id, code):
                await self._badges.create(
                    owner_id=owner_id, badge_code=code, earned_at=date.today()
                )
                earned.append(code)

        return earned
