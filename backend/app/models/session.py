"""
models/session.py
Pomodoro çalışma seansları.
Her seans not, görev ve kullanıcıya bağlanır.
"""
from datetime import datetime
from sqlalchemy import Integer, ForeignKey, DateTime, Text, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models import TimestampMixin


class StudySession(Base, TimestampMixin):
    __tablename__ = "study_sessions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    note_id: Mapped[int | None] = mapped_column(
        ForeignKey("notes.id", ondelete="SET NULL"), nullable=True, index=True
    )
    task_id: Mapped[int | None] = mapped_column(
        ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # Zamanlama
    started_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    pomodoro_count: Mapped[int] = mapped_column(Integer, default=0)

    # Durum: active | paused | completed | abandoned
    status: Mapped[str] = mapped_column(String(20), default="active", index=True)

    # Seans sırasında alınan hızlı notlar
    quick_notes: Mapped[str] = mapped_column(Text, default="")

    # İlişkiler
    owner: Mapped["User"] = relationship("User", back_populates="sessions", lazy="noload")  # noqa: F821
    note: Mapped["Note | None"] = relationship("Note", lazy="noload")  # noqa: F821
    task: Mapped["Task | None"] = relationship("Task", lazy="noload")  # noqa: F821

    def __repr__(self) -> str:
        return f"<StudySession id={self.id} status={self.status!r} duration={self.duration_seconds}s>"
