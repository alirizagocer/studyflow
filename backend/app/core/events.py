"""
core/events.py
Observer Pattern — modüller arası loose coupling sağlar.
Örnek: session bitince → istatistik güncelle → streak kontrol et → bildirim gönder
Django'nun signals sistemine karşılık gelir.
"""
import asyncio
import logging
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime
from enum import StrEnum
from typing import Any, Callable, Coroutine

logger = logging.getLogger(__name__)


class EventType(StrEnum):
    # Çalışma seansları
    SESSION_STARTED = "session.started"
    SESSION_PAUSED  = "session.paused"
    SESSION_ENDED   = "session.ended"

    # Notlar
    NOTE_CREATED   = "note.created"
    NOTE_UPDATED   = "note.updated"

    # Görevler
    TASK_COMPLETED = "task.completed"

    # Hedefler
    GOAL_PROGRESS  = "goal.progress"
    GOAL_ACHIEVED  = "goal.achieved"

    # Streak
    STREAK_UPDATED = "streak.updated"
    STREAK_BROKEN  = "streak.broken"

    # Takvim
    CALENDAR_SYNC  = "calendar.sync"


@dataclass
class Event:
    type: EventType
    user_id: int
    payload: dict[str, Any] = field(default_factory=dict)
    occurred_at: datetime = field(default_factory=datetime.utcnow)


Handler = Callable[[Event], Coroutine[Any, Any, None]]


class EventBus:
    """
    Async event bus — Singleton.
    Handler'lar event type'a göre kayıt edilir ve async olarak çağrılır.
    """

    def __init__(self):
        self._handlers: dict[EventType, list[Handler]] = defaultdict(list)

    def subscribe(self, event_type: EventType, handler: Handler) -> None:
        """Bir event için handler kayıt et."""
        self._handlers[event_type].append(handler)
        logger.debug("Subscribed %s to %s", handler.__name__, event_type)

    def unsubscribe(self, event_type: EventType, handler: Handler) -> None:
        """Handler kaydını sil."""
        self._handlers[event_type].remove(handler)

    async def publish(self, event: Event) -> None:
        """
        Event'i tüm kayıtlı handler'lara gönder.
        Handler hataları diğer handler'ları etkilemez.
        """
        handlers = self._handlers.get(event.type, [])
        if not handlers:
            return

        tasks = [self._safe_call(h, event) for h in handlers]
        await asyncio.gather(*tasks)

    async def _safe_call(self, handler: Handler, event: Event) -> None:
        try:
            await handler(event)
        except Exception as exc:
            logger.exception("Handler %s failed for event %s: %s", handler.__name__, event.type, exc)


# Singleton instance
event_bus = EventBus()
