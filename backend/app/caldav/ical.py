"""
caldav/ical.py
iCalendar (.ics) dosyası üretimi — telefon takvimiyle senkronizasyon.

NASIL ÇALIŞIR:
1. Kullanıcı bu endpoint'ten bir URL alır: GET /api/calendar/{token}/studyflow.ics
2. Bu URL'yi iOS/Android'de "Abone Olunan Takvim" olarak ekler
3. Telefon periyodik olarak bu URL'yi kontrol eder ve görevleri takvime yansıtır
4. Bulut gerektirmez — aynı WiFi'deyken yerel IP ile çalışır
5. İnternetten erişim için: cloudflared tunnel (ücretsiz) veya ngrok

iOS: Ayarlar → Takvim → Hesaplar → Hesap Ekle → Diğer → Abone Olunan Takvim Ekle
Android: Google Calendar → ⊕ → URL'den
"""
from datetime import datetime, date, timedelta, timezone
from typing import Sequence

from app.models.task import Task
from app.core.config import get_settings

settings = get_settings()

# RFC 5545 iCalendar standardı
_ICAL_HEADER = """\
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//StudyFlow//StudyFlow App//TR
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:StudyFlow
X-WR-TIMEZONE:Europe/Istanbul
X-WR-CALDESC:StudyFlow görevleri ve çalışma planı
"""

_ICAL_FOOTER = "END:VCALENDAR\r\n"


def _escape(text: str) -> str:
    """iCal string escape — özel karakterleri kaçır."""
    return text.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n")


def _fold_line(line: str) -> str:
    """
    RFC 5545 line folding: 75 karakterden uzun satırları böl.
    CRLF + boşluk ile devam eder.
    """
    if len(line.encode("utf-8")) <= 75:
        return line + "\r\n"
    result = []
    while len(line.encode("utf-8")) > 75:
        # UTF-8 byte sınırına dikkat et
        chunk = line[:75]
        while len(chunk.encode("utf-8")) > 75:
            chunk = chunk[:-1]
        result.append(chunk)
        line = " " + line[len(chunk):]
    result.append(line)
    return "\r\n".join(result) + "\r\n"


def _format_dt(dt: datetime) -> str:
    """UTC datetime'ı iCal formatına çevir."""
    utc = dt.astimezone(timezone.utc)
    return utc.strftime("%Y%m%dT%H%M%SZ")


def _format_date(d: date) -> str:
    return d.strftime("%Y%m%d")


def task_to_vevent(task: Task, owner_display_name: str = "Kullanıcı") -> str:
    """
    Bir görevi VEVENT bloğuna dönüştür.
    Her görevin calendar_uid'si telefondaki kayıtla eşleştirir.
    """
    lines: list[str] = ["BEGIN:VEVENT\r\n"]

    uid = f"{task.calendar_uid}@studyflow"
    lines.append(_fold_line(f"UID:{uid}"))

    # Zaman bilgisi
    if task.scheduled_time:
        from datetime import time as dtime
        dt_start = datetime.combine(task.scheduled_date, task.scheduled_time)
        dt_end = dt_start + timedelta(minutes=task.duration_minutes)
        lines.append(_fold_line(f"DTSTART;TZID=Europe/Istanbul:{dt_start.strftime('%Y%m%dT%H%M%S')}"))
        lines.append(_fold_line(f"DTEND;TZID=Europe/Istanbul:{dt_end.strftime('%Y%m%dT%H%M%S')}"))
    else:
        # Saat belirtilmemişse tam gün etkinlik
        lines.append(_fold_line(f"DTSTART;VALUE=DATE:{_format_date(task.scheduled_date)}"))
        lines.append(_fold_line(f"DTEND;VALUE=DATE:{_format_date(task.scheduled_date + timedelta(days=1))}"))

    lines.append(_fold_line(f"SUMMARY:📚 {_escape(task.title)}"))

    desc_parts = [f"Süre: {task.duration_minutes} dakika"]
    if task.description:
        desc_parts.append(_escape(task.description))
    if task.is_completed:
        desc_parts.append("✅ Tamamlandı")
    lines.append(_fold_line(f"DESCRIPTION:{' | '.join(desc_parts)}"))

    # Renk kategorisi
    lines.append(_fold_line("CATEGORIES:StudyFlow,Çalışma"))
    if task.is_completed:
        lines.append(_fold_line("STATUS:COMPLETED"))
    else:
        lines.append(_fold_line("STATUS:CONFIRMED"))

    # Hatırlatıcı: 15 dakika önce
    lines.append("BEGIN:VALARM\r\n")
    lines.append("TRIGGER:-PT15M\r\n")
    lines.append("ACTION:DISPLAY\r\n")
    lines.append(_fold_line(f"DESCRIPTION:⏰ {_escape(task.title)} başlamak üzere"))
    lines.append("END:VALARM\r\n")

    now_str = _format_dt(datetime.now(timezone.utc))
    lines.append(_fold_line(f"DTSTAMP:{now_str}"))
    lines.append(_fold_line(f"LAST-MODIFIED:{now_str}"))
    lines.append("END:VEVENT\r\n")

    return "".join(lines)


def generate_ical(tasks: Sequence[Task], owner_display_name: str = "Kullanıcı") -> bytes:
    """
    Tüm görevlerden iCalendar dosyası üret.
    Telefon bu dosyayı periyodik indirerek takvimi günceller.
    """
    parts = [_ICAL_HEADER]
    for task in tasks:
        parts.append(task_to_vevent(task, owner_display_name))
    parts.append(_ICAL_FOOTER)
    return "".join(parts).encode("utf-8")
