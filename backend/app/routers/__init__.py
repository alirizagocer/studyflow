"""
routers/auth.py         → /api/auth/*
routers/notes.py        → /api/notes/*, /api/folders/*
routers/tasks.py        → /api/tasks/*
routers/sessions.py     → /api/sessions/*
routers/stats.py        → /api/stats/*
routers/goals.py        → /api/goals/*
routers/calendar.py     → /api/calendar/* (iCalendar sync)

Django'nun urls.py + views.py kombinasyonuna karşılık gelir.
Router sadece HTTP katmanıdır — iş mantığı service'lerde.
"""
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.core.database import get_db
from app.middleware.security import CurrentUser, auth_rate_limit, default_rate_limit
from app.services import (
    AuthService, FolderService, NoteService,
    TaskService, SessionService, StatsService, GoalService,
)
from app.schemas import (
    UserRegister, UserLogin, TokenOut, UserOut,
    FolderCreate, FolderUpdate, FolderOut,
    NoteCreate, NoteUpdate, NoteOut, NoteListItem,
    TaskCreate, TaskUpdate, TaskOut,
    SessionStart, SessionEnd, SessionOut,
    GoalCreate, GoalOut, BadgeOut,
    WeeklyStats, OKResponse,
)
from app.repositories import TaskRepository
from app.caldav.ical import generate_ical

logger = logging.getLogger(__name__)


# ── Auth Router ───────────────────────────────────────────────────────────────
auth_router = APIRouter(prefix="/api/auth", tags=["auth"])

@auth_router.post("/register", response_model=TokenOut, status_code=201, dependencies=[Depends(auth_rate_limit)])
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    try:
        return await AuthService(db).register(data)
    except ValueError as e:
        raise HTTPException(status.HTTP_409_CONFLICT, str(e))


@auth_router.post("/login", response_model=TokenOut, dependencies=[Depends(auth_rate_limit)])
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    try:
        return await AuthService(db).login(data)
    except ValueError as e:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, str(e))


@auth_router.get("/me", response_model=UserOut)
async def me(current_user: CurrentUser):
    return UserOut.model_validate(current_user)


# ── Folder Router ─────────────────────────────────────────────────────────────
folder_router = APIRouter(prefix="/api/folders", tags=["folders"])

@folder_router.get("", response_model=list[dict])
async def list_folders(current_user: CurrentUser, db: AsyncSession = Depends(get_db)):
    return await FolderService(db).get_tree(current_user.id)


@folder_router.post("", response_model=FolderOut, status_code=201)
async def create_folder(data: FolderCreate, current_user: CurrentUser, db: AsyncSession = Depends(get_db)):
    try:
        return await FolderService(db).create(current_user.id, data)
    except ValueError as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e))


@folder_router.patch("/{folder_id}", response_model=FolderOut)
async def rename_folder(folder_id: int, data: FolderUpdate, current_user: CurrentUser, db: AsyncSession = Depends(get_db)):
    try:
        return await FolderService(db).rename(folder_id, current_user.id, data)
    except ValueError as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))


@folder_router.delete("/{folder_id}", response_model=OKResponse)
async def delete_folder(folder_id: int, current_user: CurrentUser, db: AsyncSession = Depends(get_db)):
    try:
        await FolderService(db).delete(folder_id, current_user.id)
        return OKResponse(message="Klasör silindi")
    except ValueError as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))


# ── Note Router ───────────────────────────────────────────────────────────────
note_router = APIRouter(prefix="/api/notes", tags=["notes"])

@note_router.get("", response_model=list[NoteOut])
async def list_notes(folder_id: int, current_user: CurrentUser, db: AsyncSession = Depends(get_db)):
    return await NoteService(db).list_by_folder(folder_id, current_user.id)


@note_router.get("/search", response_model=list[NoteOut])
async def search_notes(q: str, current_user: CurrentUser, db: AsyncSession = Depends(get_db)):
    return await NoteService(db).search(current_user.id, q)


@note_router.get("/{note_id}", response_model=NoteOut)
async def get_note(note_id: int, current_user: CurrentUser, db: AsyncSession = Depends(get_db)):
    try:
        return await NoteService(db).get(note_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))


@note_router.post("", response_model=NoteOut, status_code=201)
async def create_note(data: NoteCreate, current_user: CurrentUser, db: AsyncSession = Depends(get_db)):
    try:
        return await NoteService(db).create(current_user.id, data)
    except ValueError as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e))


@note_router.patch("/{note_id}", response_model=NoteOut)
async def update_note(note_id: int, data: NoteUpdate, current_user: CurrentUser, db: AsyncSession = Depends(get_db)):
    try:
        return await NoteService(db).update(note_id, current_user.id, data)
    except ValueError as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))


@note_router.delete("/{note_id}", response_model=OKResponse)
async def delete_note(note_id: int, current_user: CurrentUser, db: AsyncSession = Depends(get_db)):
    try:
        await NoteService(db).delete(note_id, current_user.id)
        return OKResponse(message="Not silindi")
    except ValueError as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))


# ── Task Router ───────────────────────────────────────────────────────────────
task_router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@task_router.get("/today", response_model=list[TaskOut])
async def today_tasks(current_user: CurrentUser, db: AsyncSession = Depends(get_db)):
    return await TaskService(db).list_today(current_user.id)


@task_router.get("", response_model=list[TaskOut])
async def list_tasks(start: date, end: date, current_user: CurrentUser, db: AsyncSession = Depends(get_db)):
    try:
        return await TaskService(db).list_range(current_user.id, start, end)
    except ValueError as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e))


@task_router.post("", response_model=TaskOut, status_code=201)
async def create_task(data: TaskCreate, current_user: CurrentUser, db: AsyncSession = Depends(get_db)):
    return await TaskService(db).create(current_user.id, data)


@task_router.patch("/{task_id}", response_model=TaskOut)
async def update_task(task_id: int, data: TaskUpdate, current_user: CurrentUser, db: AsyncSession = Depends(get_db)):
    try:
        return await TaskService(db).update(task_id, current_user.id, data)
    except ValueError as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))


@task_router.post("/{task_id}/complete", response_model=TaskOut)
async def complete_task(task_id: int, actual_minutes: int = 0, current_user: CurrentUser = None, db: AsyncSession = Depends(get_db)):
    try:
        return await TaskService(db).complete(task_id, current_user.id, actual_minutes)
    except ValueError as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))


@task_router.delete("/{task_id}", response_model=OKResponse)
async def delete_task(task_id: int, current_user: CurrentUser, db: AsyncSession = Depends(get_db)):
    try:
        await TaskService(db).delete(task_id, current_user.id)
        return OKResponse(message="Görev silindi")
    except ValueError as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))


# ── Session Router ────────────────────────────────────────────────────────────
session_router = APIRouter(prefix="/api/sessions", tags=["sessions"])

@session_router.post("/start", response_model=SessionOut, status_code=201)
async def start_session(data: SessionStart, current_user: CurrentUser, db: AsyncSession = Depends(get_db)):
    try:
        return await SessionService(db).start(current_user.id, data)
    except ValueError as e:
        raise HTTPException(status.HTTP_409_CONFLICT, str(e))


@session_router.post("/end", response_model=SessionOut)
async def end_session(data: SessionEnd, current_user: CurrentUser, db: AsyncSession = Depends(get_db)):
    try:
        return await SessionService(db).end(current_user.id, data)
    except ValueError as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))


# ── Stats Router ──────────────────────────────────────────────────────────────
stats_router = APIRouter(prefix="/api/stats", tags=["stats"])

@stats_router.get("/weekly", response_model=WeeklyStats)
async def weekly_stats(week_start: date, current_user: CurrentUser, db: AsyncSession = Depends(get_db)):
    return await StatsService(db).weekly(current_user.id, week_start)


# ── Goal Router ───────────────────────────────────────────────────────────────
goal_router = APIRouter(prefix="/api/goals", tags=["goals"])

@goal_router.get("", response_model=list[GoalOut])
async def list_goals(current_user: CurrentUser, db: AsyncSession = Depends(get_db)):
    return await GoalService(db).list_active(current_user.id)


@goal_router.post("", response_model=GoalOut, status_code=201)
async def create_goal(data: GoalCreate, current_user: CurrentUser, db: AsyncSession = Depends(get_db)):
    return await GoalService(db).create(current_user.id, data)


@goal_router.get("/badges", response_model=list[BadgeOut])
async def list_badges(current_user: CurrentUser, db: AsyncSession = Depends(get_db)):
    from app.repositories import BadgeRepository
    repo = BadgeRepository(db)
    badges = await repo.list_user_badges(current_user.id)
    return [BadgeOut.model_validate(b) for b in badges]


# ── Calendar Router ───────────────────────────────────────────────────────────
calendar_router = APIRouter(prefix="/api/calendar", tags=["calendar"])

@calendar_router.get("/{user_token}/studyflow.ics")
async def get_calendar(
    user_token: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Telefon takvimiyle senkronizasyon endpoint'i.
    Bu URL iOS/Android'de "Abone Olunan Takvim" olarak eklenir.
    user_token: JWT access token (URL'de kullanılır, auth header gerekmiyor)
    """
    from app.core.security import decode_access_token
    from app.repositories import TaskRepository, UserRepository
    from datetime import timedelta

    try:
        payload = decode_access_token(user_token)
        user_id = int(payload["sub"])
    except (ValueError, KeyError):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Geçersiz token")

    user = await UserRepository(db).get(user_id)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND)

    # Önümüzdeki 30 + geçmiş 7 günün görevlerini al
    today = date.today()
    tasks = await TaskRepository(db).list_range(user_id, today - timedelta(days=7), today + timedelta(days=30))

    ical_bytes = generate_ical(tasks, user.display_name)

    return Response(
        content=ical_bytes,
        media_type="text/calendar; charset=utf-8",
        headers={
            "Content-Disposition": 'attachment; filename="studyflow.ics"',
            "Cache-Control": "no-cache, no-store",
        },
    )


# ── Router Listesi — main.py'de kullanılacak ─────────────────────────────────
all_routers = [
    auth_router,
    folder_router,
    note_router,
    task_router,
    session_router,
    stats_router,
    goal_router,
    calendar_router,
]
