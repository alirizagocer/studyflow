"""
schemas/
Pydantic v2 şemaları — Django REST Framework serializers'a karşılık gelir.
Input validasyonu + output serializasyonu burada yapılır.
"""
from datetime import date, time, datetime
from pydantic import BaseModel, EmailStr, Field, field_validator
import re


# ── Shared ────────────────────────────────────────────────────────────────────

class OKResponse(BaseModel):
    ok: bool = True
    message: str = ""


# ── User / Auth ───────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    display_name: str = Field(min_length=2, max_length=100)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Şifre en az bir büyük harf içermeli")
        if not re.search(r"\d", v):
            raise ValueError("Şifre en az bir rakam içermeli")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    display_name: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# ── Folder ────────────────────────────────────────────────────────────────────

class FolderCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    parent_id: int | None = None


class FolderUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=200)


class FolderOut(BaseModel):
    id: int
    name: str
    parent_id: int | None
    note_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}


class FolderTree(FolderOut):
    """Recursive klasör ağacı — frontend sidebar için."""
    children: list["FolderTree"] = []


# ── Note ──────────────────────────────────────────────────────────────────────

class NoteCreate(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    content: str = ""
    folder_id: int
    tags: list[str] = []


class NoteUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=500)
    content: str | None = None
    tags: list[str] | None = None
    folder_id: int | None = None


class NoteOut(BaseModel):
    id: int
    title: str
    content: str
    folder_id: int
    tags: list[str]
    time_spent: int       # saniye
    revision_count: int
    created_at: datetime
    updated_at: datetime
    linked_note_ids: list[int] = []

    model_config = {"from_attributes": True}


class NoteListItem(BaseModel):
    """Liste görünümü için hafif schema — content dahil değil."""
    id: int
    title: str
    folder_id: int
    tags: list[str]
    time_spent: int
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Task ──────────────────────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    description: str = ""
    scheduled_date: date
    scheduled_time: time | None = None
    duration_minutes: int = Field(default=60, ge=5, le=480)
    note_id: int | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    scheduled_date: date | None = None
    scheduled_time: time | None = None
    duration_minutes: int | None = Field(default=None, ge=5, le=480)
    is_completed: bool | None = None
    actual_minutes: int | None = None


class TaskOut(BaseModel):
    id: int
    title: str
    description: str
    scheduled_date: date
    scheduled_time: time | None
    duration_minutes: int
    is_completed: bool
    actual_minutes: int
    note_id: int | None
    calendar_uid: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── StudySession ──────────────────────────────────────────────────────────────

class SessionStart(BaseModel):
    note_id: int | None = None
    task_id: int | None = None


class SessionEnd(BaseModel):
    quick_notes: str = ""


class SessionOut(BaseModel):
    id: int
    note_id: int | None
    task_id: int | None
    started_at: datetime
    ended_at: datetime | None
    duration_seconds: int
    pomodoro_count: int
    status: str
    quick_notes: str

    model_config = {"from_attributes": True}


# ── Stats ─────────────────────────────────────────────────────────────────────

class DayStats(BaseModel):
    date: date
    total_seconds: int
    session_count: int
    pomodoro_count: int


class SubjectStats(BaseModel):
    folder_id: int
    folder_name: str
    total_seconds: int


class WeeklyStats(BaseModel):
    week_start: date
    total_seconds: int
    daily: list[DayStats]
    by_subject: list[SubjectStats]
    streak_days: int


# ── Goal ─────────────────────────────────────────────────────────────────────

class GoalCreate(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    goal_type: str = Field(pattern=r"^(weekly_hours|daily_hours|streak|total_notes|subject_hours)$")
    target: float = Field(gt=0)
    deadline: date | None = None


class GoalOut(BaseModel):
    id: int
    title: str
    goal_type: str
    target: float
    current: float
    progress_pct: float
    deadline: date | None
    is_achieved: bool
    is_active: bool

    model_config = {"from_attributes": True}


class BadgeOut(BaseModel):
    badge_code: str
    earned_at: date

    model_config = {"from_attributes": True}
