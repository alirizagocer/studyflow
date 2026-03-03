"""
models/note.py
Hiyerarşik klasör + not yapısı.
İlişkiler: User → Folder (tree) → Note
Notlar arası bağlantı: NoteLink (Graph yapısı)
"""
from sqlalchemy import String, Text, Integer, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models import TimestampMixin

# Notlar arası M2M bağlantı tablosu (Graf kenarları)
note_links = Table(
    "note_links",
    Base.metadata,
    Column("source_id", Integer, ForeignKey("notes.id", ondelete="CASCADE"), primary_key=True),
    Column("target_id", Integer, ForeignKey("notes.id", ondelete="CASCADE"), primary_key=True),
)


class Folder(Base, TimestampMixin):
    __tablename__ = "folders"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    # Self-referential ilişki — Tree yapısı
    parent_id: Mapped[int | None] = mapped_column(
        ForeignKey("folders.id", ondelete="CASCADE"), nullable=True, index=True
    )
    parent: Mapped["Folder | None"] = relationship(
        "Folder", back_populates="children", remote_side="Folder.id", lazy="noload"
    )
    children: Mapped[list["Folder"]] = relationship(
        "Folder", back_populates="parent", cascade="all, delete-orphan", lazy="noload"
    )

    owner: Mapped["User"] = relationship("User", back_populates="folders", lazy="noload")  # noqa: F821
    notes: Mapped[list["Note"]] = relationship(
        "Note", back_populates="folder", cascade="all, delete-orphan", lazy="noload"
    )

    def __repr__(self) -> str:
        return f"<Folder id={self.id} name={self.name!r}>"


class Note(Base, TimestampMixin):
    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, default="")
    folder_id: Mapped[int] = mapped_column(ForeignKey("folders.id", ondelete="CASCADE"), index=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    # İstatistik alanları
    time_spent: Mapped[int] = mapped_column(Integer, default=0)  # saniye cinsinden
    revision_count: Mapped[int] = mapped_column(Integer, default=0)

    # Etiketler — JSON string olarak saklanır (basit, ölçeklenebilir)
    tags_json: Mapped[str] = mapped_column(Text, default="[]")

    # İlişkiler
    folder: Mapped["Folder"] = relationship("Folder", back_populates="notes", lazy="noload")
    owner: Mapped["User"] = relationship("User", lazy="noload")  # noqa: F821

    # Graf yapısı: notlar arası bağlantılar
    linked_notes: Mapped[list["Note"]] = relationship(
        "Note",
        secondary=note_links,
        primaryjoin="Note.id == note_links.c.source_id",
        secondaryjoin="Note.id == note_links.c.target_id",
        lazy="noload",
    )

    @property
    def tags(self) -> list[str]:
        import json
        try:
            return json.loads(self.tags_json)
        except (ValueError, TypeError):
            return []

    @tags.setter
    def tags(self, value: list[str]) -> None:
        import json
        self.tags_json = json.dumps(value, ensure_ascii=False)

    def __repr__(self) -> str:
        return f"<Note id={self.id} title={self.title!r}>"
