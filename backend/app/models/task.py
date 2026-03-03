"""
models/task.py
Günlük planlama görevleri.
Her görev bir iCalendar UID'sine sahip — telefon takvim senkronizasyonu için.
"""
import uuid
from datetime import date, time
from sqlalchemy import String, Integer, Boolean, ForeignKey, Date, Time, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models import TimestampMixin


class Task(Base, TimestampMixin):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    note_id: Mapped[int | None] = mapped_column(
        ForeignKey("notes.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # Zamanlama
    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    scheduled_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=60)

    # Durum
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    actual_minutes: Mapped[int] = mapped_column(Integer, default=0)

    # Takvim senkronizasyonu için UUID
    # Bu UID, telefon takvimine gönderilen .ics dosyasında kullanılır
    calendar_uid: Mapped[str] = mapped_column(
        String(255),
        default=lambda: str(uuid.uuid4()),
        unique=True,
        index=True,
    )

    # İlişkiler
    owner: Mapped["User"] = relationship("User", back_populates="tasks", lazy="noload")  # noqa: F821
    note: Mapped["Note | None"] = relationship("Note", lazy="noload")  # noqa: F821

    def __repr__(self) -> str:
        return f"<Task id={self.id} title={self.title!r} date={self.scheduled_date}>"
