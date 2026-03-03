"""
core/config.py
Uygulama konfigürasyonu — tüm ayarlar buradan yönetilir.
Django'nun settings.py'sına karşılık gelir.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from pathlib import Path


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── Uygulama ──────────────────────────────────────────────────────────────
    APP_NAME: str = "StudyFlow"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"  # development | production

    # ── Veritabanı ────────────────────────────────────────────────────────────
    # SQLite (varsayılan, ücretsiz) → PostgreSQL'e geçiş için sadece bu satırı değiştir
    DATABASE_URL: str = "sqlite+aiosqlite:///./studyflow.db"
    # PostgreSQL örneği:
    # DATABASE_URL: str = "postgresql+asyncpg://user:pass@localhost/studyflow"

    # ── Güvenlik ──────────────────────────────────────────────────────────────
    SECRET_KEY: str = "CHANGE_THIS_IN_PRODUCTION_USE_OPENSSL_RAND_HEX_32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 saat
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # ── Rate Limiting ──────────────────────────────────────────────────────────
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_AUTH_PER_MINUTE: int = 10  # Auth endpoint'lere daha az

    # ── CORS ──────────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",      # React dev server
        "http://localhost:5173",      # Vite dev server
        "app://.",                    # Electron production
    ]

    # ── CalDAV / Takvim ───────────────────────────────────────────────────────
    # Kullanıcıların telefon takvimiyle senkronize etmesi için base URL
    # Yerel ağda: http://192.168.1.X:8000 (aynı wifi'deyken)
    # İnternet üzerinde: ngrok/cloudflare tunnel URL
    CALENDAR_BASE_URL: str = "http://localhost:8000"

    # ── Dosya Depolama ────────────────────────────────────────────────────────
    NOTES_DIR: Path = Path("./data/notes")
    EXPORTS_DIR: Path = Path("./data/exports")

    def model_post_init(self, __context) -> None:
        # Gerekli dizinleri oluştur
        self.NOTES_DIR.mkdir(parents=True, exist_ok=True)
        self.EXPORTS_DIR.mkdir(parents=True, exist_ok=True)


@lru_cache  # Singleton pattern — her çağrıda yeni nesne oluşturma
def get_settings() -> Settings:
    return Settings()
