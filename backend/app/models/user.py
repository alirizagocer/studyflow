"""
models/user.py
"""
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models import TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships — lazy="select" yerine explicit seçeceğiz (N+1 önlemi)
    folders: Mapped[list["Folder"]] = relationship(  # noqa: F821
        back_populates="owner", cascade="all, delete-orphan", lazy="noload"
    )
    tasks: Mapped[list["Task"]] = relationship(  # noqa: F821
        back_populates="owner", cascade="all, delete-orphan", lazy="noload"
    )
    sessions: Mapped[list["StudySession"]] = relationship(  # noqa: F821
        back_populates="owner", cascade="all, delete-orphan", lazy="noload"
    )
    goals: Mapped[list["Goal"]] = relationship(  # noqa: F821
        back_populates="owner", cascade="all, delete-orphan", lazy="noload"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r}>"
