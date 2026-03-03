"""
tests/test_services.py
Servis katmanı unit testleri.
pytest-asyncio ile async test desteği.
"""
import pytest
from datetime import date
from unittest.mock import AsyncMock, MagicMock

from app.schemas import NoteCreate, TaskCreate, SessionStart, SessionEnd


# ── Not testleri ──────────────────────────────────────────────────────────────

class TestNoteService:
    @pytest.mark.asyncio
    async def test_create_note_validates_folder_ownership(self):
        """
        Not oluşturma: klasör başka kullanıcıya aitse hata verilmeli.
        Repository mock'lanır — gerçek DB gerekmez.
        """
        from app.services import NoteService

        mock_db = AsyncMock()
        service = NoteService(mock_db)

        # FolderRepository.get_user_folder → None döndür (klasör yok)
        service._folders = AsyncMock()
        service._folders.get_user_folder = AsyncMock(return_value=None)

        with pytest.raises(ValueError, match="Klasör bulunamadı"):
            await service.create(
                owner_id=1,
                data=NoteCreate(title="Test", folder_id=999, content=""),
            )

    @pytest.mark.asyncio
    async def test_search_returns_empty_for_short_query(self):
        from app.services import NoteService
        mock_db = AsyncMock()
        service = NoteService(mock_db)
        result = await service.search(owner_id=1, query="a")  # 1 karakter
        assert result == []


# ── Task testleri ─────────────────────────────────────────────────────────────

class TestTaskService:
    @pytest.mark.asyncio
    async def test_list_range_max_90_days(self):
        from app.services import TaskService
        mock_db = AsyncMock()
        service = TaskService(mock_db)
        service._tasks = AsyncMock()

        start = date(2026, 1, 1)
        end = date(2026, 5, 1)  # 120 gün — limit aşılmalı

        with pytest.raises(ValueError, match="90"):
            await service.list_range(owner_id=1, start=start, end=end)


# ── iCalendar testleri ────────────────────────────────────────────────────────

class TestICalGeneration:
    def test_generate_valid_ical(self):
        from app.caldav.ical import generate_ical
        from unittest.mock import MagicMock
        from datetime import time

        task = MagicMock()
        task.calendar_uid = "test-uid-123"
        task.title = "Binary Tree Çalışması"
        task.description = "Veri yapıları ödev"
        task.scheduled_date = date(2026, 3, 10)
        task.scheduled_time = time(9, 0)
        task.duration_minutes = 90
        task.is_completed = False

        result = generate_ical([task], "Test User")

        assert b"BEGIN:VCALENDAR" in result
        assert b"END:VCALENDAR" in result
        assert b"BEGIN:VEVENT" in result
        assert b"test-uid-123@studyflow" in result
        assert "Binary Tree".encode() in result

    def test_ical_line_folding(self):
        """RFC 5545: 75 karakterden uzun satırlar bölünmeli."""
        from app.caldav.ical import _fold_line
        long_line = "SUMMARY:" + "A" * 100
        folded = _fold_line(long_line)
        lines = folded.split("\r\n")
        for line in lines:
            assert len(line.encode("utf-8")) <= 75 + 1  # +1 continuation space


# ── Güvenlik testleri ─────────────────────────────────────────────────────────

class TestSecurity:
    def test_password_hash_and_verify(self):
        from app.core.security import hash_password, verify_password
        plain = "SecurePass123"
        hashed = hash_password(plain)
        assert hashed != plain
        assert verify_password(plain, hashed)
        assert not verify_password("WrongPass123", hashed)

    def test_jwt_roundtrip(self):
        from app.core.security import create_access_token, decode_access_token
        token = create_access_token(user_id=42, email="test@example.com")
        payload = decode_access_token(token)
        assert payload["sub"] == "42"
        assert payload["email"] == "test@example.com"

    def test_invalid_token_raises(self):
        from app.core.security import decode_access_token
        with pytest.raises(ValueError):
            decode_access_token("invalid.token.here")
