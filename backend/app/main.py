"""
app/main.py
FastAPI uygulama başlangıç noktası — Django'nun wsgi.py + urls.py kombinasyonu.
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.core.config import get_settings
from app.core.database import init_db, close_db
from app.core.events import event_bus, EventType, Event
from app.middleware.security import security_headers_middleware
from app.routers import all_routers
from app.services import GoalService

settings = get_settings()

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


# ── Observer kayıtları ────────────────────────────────────────────────────────

async def _on_session_ended(event: Event) -> None:
    """Session bitince istatistik ve rozet kontrolü yap."""
    from app.core.database import _get_session_factory
    factory = _get_session_factory()
    async with factory() as db:
        service = GoalService(db)
        new_badges = await service.check_and_award_badges(event.user_id)
        if new_badges:
            logger.info("User %d earned badges: %s", event.user_id, new_badges)


def _register_event_handlers() -> None:
    event_bus.subscribe(EventType.SESSION_ENDED, _on_session_ended)


# ── Lifecycle ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 StudyFlow başlatılıyor...")
    await init_db()
    _register_event_handlers()
    logger.info("✅ Veritabanı hazır, event handler'lar kayıtlı")
    yield
    logger.info("🛑 StudyFlow kapatılıyor...")
    await close_db()


# ── Uygulama ──────────────────────────────────────────────────────────────────

app = FastAPI(
    title="StudyFlow API",
    version=settings.APP_VERSION,
    docs_url="/docs" if settings.DEBUG else None,   # Prod'da Swagger gizle
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# Middleware sırası önemli — dışarıdan içeriye doğru çalışır
app.middleware("http")(security_headers_middleware)

app.add_middleware(GZipMiddleware, minimum_size=1000)  # Yanıtları sıkıştır

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# Tüm router'ları kaydet
for router in all_routers:
    app.include_router(router)


@app.get("/health")
async def health():
    """Load balancer / uptime monitor için health check."""
    return {"status": "ok", "version": settings.APP_VERSION}
