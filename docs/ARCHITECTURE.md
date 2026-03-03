# StudyFlow — Teknik Mimari Dökümanı

## Klasör Yapısı ve Sorumluluklar

```
backend/app/
│
├── core/                    ← Altyapı katmanı (framework bağımsız)
│   ├── config.py            ← Tek kaynak (12-factor app prensibi)
│   ├── database.py          ← DB bağlantısı (Singleton)
│   ├── security.py          ← JWT + bcrypt
│   └── events.py            ← Event Bus (Observer Pattern)
│
├── models/                  ← Veri modelleri (SQLAlchemy ORM)
│   ├── user.py
│   ├── note.py              ← Folder (Tree) + Note (Graph bağlantıları)
│   ├── task.py              ← CalDAV UUID dahil
│   ├── session.py           ← Pomodoro seansları
│   └── goal.py              ← Hedefler + Rozetler
│
├── schemas/                 ← Input/Output şemaları (Pydantic)
│   └── __init__.py          ← UserRegister, NoteCreate, TaskOut, ...
│
├── repositories/            ← Veri erişim katmanı (Repository Pattern)
│   ├── base.py              ← Generic CRUD (DRY)
│   └── __init__.py          ← UserRepo, NoteRepo, TaskRepo, ...
│
├── services/                ← İş mantığı katmanı (Service Layer)
│   └── __init__.py          ← AuthService, NoteService, TaskService, ...
│
├── routers/                 ← HTTP katmanı (FastAPI router'lar)
│   └── __init__.py          ← auth, notes, tasks, calendar endpoints
│
├── middleware/
│   └── security.py          ← JWT auth dep., rate limiter, güvenlik headers
│
└── caldav/
    └── ical.py              ← RFC 5545 iCalendar üretimi
```

## Design Patterns

### 1. Repository Pattern
```
Router → Service → Repository → Database
```
Repository veri erişimini soyutlar. Service hiçbir SQL görmez.
Test sırasında repository mock'lanır — DB olmadan test edilir.

### 2. Service Layer Pattern
Router'da hiç iş mantığı yok. Service şunları yapar:
- Input validasyonu (schema'dan sonra ikinci katman)
- Sahiplik kontrolü (A kullanıcısı B'nin notunu düzenleyemez)
- Event yayını (session bitince streak güncellenir)
- İşlemsel mantık

### 3. Observer Pattern (Event Bus)
```python
# Yayıncı (service):
await event_bus.publish(Event(EventType.SESSION_ENDED, user_id=1, ...))

# Dinleyici (bağımsız):
async def on_session_ended(event): 
    await check_badges(event.user_id)

event_bus.subscribe(EventType.SESSION_ENDED, on_session_ended)
```
Modüller birbirini import etmez — loose coupling.

### 4. Factory Pattern
```python
# BaseRepository.create() — nesne oluşturma mantığı merkezi
await self._sessions.create(owner_id=..., note_id=..., ...)
```

### 5. Singleton Pattern
```python
@lru_cache  # Sadece bir kez çağrılır
def get_settings() -> Settings: ...

_engine: AsyncEngine | None = None  # Tek DB bağlantısı
```

## Güvenlik Önlemleri

| Tehdit | Çözüm |
|--------|-------|
| SQL Injection | SQLAlchemy ORM (parametrized queries) |
| XSS | React'ın varsayılan HTML escape + CSP headers |
| CSRF | JWT (cookie değil Bearer token) |
| Brute Force | Rate limiter (auth'a özel daha kısıtlı) |
| Timing Attack | bcrypt.verify() — sabit süre |
| Token Çalınması | Short-lived access token (24s) + refresh |
| Path Traversal | Pydantic validasyonu + dosya yolu sanitasyonu |
| Clickjacking | X-Frame-Options: DENY |
| MIME Sniffing | X-Content-Type-Options: nosniff |
| Sahiplik Aşımı | Her sorguda owner_id filtresi |

## Ölçekleme Yolu (Ücretsiz → Ücretli)

### Faz 1: SQLite + Tek Sunucu (0-100 kullanıcı)
- Hetzner CX11: €4.5/ay
- Herhangi bir ek servis yok
- Toplam: ~€5/ay

### Faz 2: PostgreSQL (100-1000 kullanıcı)
- Hetzner CX21: €8/ay
- PostgreSQL kurulumu: ücretsiz
- Sadece DATABASE_URL değiştir
- Toplam: ~€10/ay

### Faz 3: Read Replica + Cache (1000-10000 kullanıcı)
- Hetzner CX31 primary: €15/ay
- Hetzner CX21 replica: €8/ay
- Redis (önbellek): €5/ay
- Toplam: ~€30/ay

### Faz 4: Load Balancer (10000+ kullanıcı)
- Hetzner Load Balancer: €6/ay
- 3x uygulama sunucusu: €30/ay
- Managed PostgreSQL: €30/ay
- Toplam: ~€70/ay

**Karşılaştırma**: AWS'de aynı altyapı ~€200-500/ay

## Takvim Senkronizasyonu — Detay

### Nasıl Çalışır?
1. Kullanıcı giriş yapar → JWT access_token alır
2. Uygulama bir webcal URL üretir: `webcal://192.168.1.X:8000/api/calendar/{token}/studyflow.ics`
3. Kullanıcı bu URL'yi telefona ekler (bir kez)
4. iOS/Android her 15 dakikada URL'yi çekip takvimi günceller
5. StudyFlow'a eklenen görevler → telefon takviminde görünür

### Aynı WiFi'da Çalışma
Telefon ve bilgisayar aynı ağdayken yerel IP kullanılır — internet bağlantısı gerekmez, bulut ücreti yok.

### İnternet Üzerinden (Ücretsiz)
```bash
# Cloudflare Tunnel (ücretsiz, kalıcı URL):
cloudflared tunnel --url http://localhost:8000

# ngrok (ücretsiz, geçici URL):
ngrok http 8000
```
Üretilen URL'yi `.env` içinde `CALENDAR_BASE_URL` olarak ayarla.

## Code Smell Önlemleri

| Smell | Önlem |
|-------|-------|
| God Object | Sorumluluk ayrımı: Model/Repo/Service/Router |
| Magic Numbers | `settings.py` içinde sabitler |
| Duplicated Code | `BaseRepository` generic CRUD |
| Long Method | Her method tek sorumluluk (SRP) |
| Feature Envy | Service kendi domain repository'sini kullanır |
| Primitive Obsession | Pydantic schemas typed DTO'lar |
| Shotgun Surgery | Observer pattern — tek değişiklik çok yere yayılmaz |
