"""
models/__init__.py + tüm modeller
Django models.py'sına karşılık gelir.
Her model kendi dosyasında olurdu; burada açıklık için birleştirdik.
"""

# ── models/base.py ────────────────────────────────────────────────────────────
from datetime import datetime, timezone
from sqlalchemy import func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class TimestampMixin:
    """Tüm modellere created_at / updated_at ekler. DRY prensibi."""
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        onupdate=lambda: datetime.now(timezone.utc),
    )
