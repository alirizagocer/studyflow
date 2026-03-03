"""
models/goal.py
Hedef ve rozet sistemi.
"""
from datetime import date
from sqlalchemy import String, Integer, Float, Boolean, ForeignKey, Date, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models import TimestampMixin


class Goal(Base, TimestampMixin):
    __tablename__ = "goals"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    title: Mapped[str] = mapped_column(String(300), nullable=False)

    # weekly_hours | daily_hours | streak | total_notes | subject_hours
    goal_type: Mapped[str] = mapped_column(String(50), nullable=False)

    target: Mapped[float] = mapped_column(Float, nullable=False)
    current: Mapped[float] = mapped_column(Float, default=0.0)

    deadline: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_achieved: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Hedef spesifik metadata (ör: hangi klasör için)
    metadata_json: Mapped[str] = mapped_column(Text, default="{}")

    owner: Mapped["User"] = relationship("User", back_populates="goals", lazy="noload")  # noqa: F821

    @property
    def progress_pct(self) -> float:
        if self.target <= 0:
            return 0.0
        return min(round((self.current / self.target) * 100, 1), 100.0)

    def __repr__(self) -> str:
        return f"<Goal id={self.id} type={self.goal_type!r} {self.current}/{self.target}>"


class Badge(Base, TimestampMixin):
    __tablename__ = "badges"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    # Rozet kodları: first_note, streak_7, hours_10, weekly_goal_x5 ...
    badge_code: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    earned_at: Mapped[date] = mapped_column(Date, nullable=False)

    owner: Mapped["User"] = relationship("User", lazy="noload")  # noqa: F821

    def __repr__(self) -> str:
        return f"<Badge id={self.id} code={self.badge_code!r}>"
