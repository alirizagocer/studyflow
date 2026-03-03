# StudyFlow — Akıllı Öğrenci Üretkenlik Sistemi

## Mimari Genel Bakış

```
studyflow/
├── backend/                  # FastAPI (Django benzeri katmanlı mimari)
│   ├── app/
│   │   ├── core/             # Config, Security, Database bağlantısı
│   │   ├── models/           # SQLAlchemy ORM modelleri (Django models.py gibi)
│   │   ├── schemas/          # Pydantic DTO'lar (Django serializers gibi)
│   │   ├── repositories/     # Veri erişim katmanı (Repository Pattern)
│   │   ├── services/         # İş mantığı katmanı (Service Layer Pattern)
│   │   ├── routers/          # HTTP endpoint'ler (Django urls.py + views.py)
│   │   ├── middleware/        # Auth, Rate limiting, Security headers
│   │   └── caldav/           # iCalendar üretimi (telefon takvim sync)
│   ├── tests/
│   └── alembic/              # Veritabanı migration'ları
├── frontend/
│   ├── src/
│   │   ├── components/       # React bileşenleri (feature bazlı)
│   │   ├── services/         # API katmanı
│   │   ├── hooks/            # Custom React hooks
│   │   ├── store/            # Zustand state management
│   │   └── utils/
│   └── electron/             # Electron ana process (Mac/Windows)
└── docs/                     # Teknik dökümanlar
```

## Teknoloji Seçimleri ve Nedenleri

| Katman | Teknoloji | Neden |
|--------|-----------|-------|
| Desktop | Electron | Mac + Windows, web teknolojileri |
| Backend | FastAPI | Django benzeri, async, otomatik Swagger |
| ORM | SQLAlchemy 2.0 | Güçlü, migration desteği |
| Veritabanı | SQLite → PostgreSQL | Başlangıç ücretsiz, ölçeklenebilir |
| Frontend | React + TypeScript | Tip güvenliği |
| State | Zustand | Redux'tan basit |
| Auth | JWT + bcrypt | Endüstri standardı |
| Takvim Sync | iCalendar (webcal) | Ücretsiz, tüm telefonlar destekler |

## Takvim Senkronizasyonu (Ücretsiz)

Telefondaki native takvim uygulaması **CalDAV/iCalendar** protokolünü destekler.
StudyFlow bir `webcal://` URL üretir. Kullanıcı bu URL'yi telefonuna ekler → görevler otomatik görünür.

### iOS (iPhone)
Ayarlar → Takvim → Hesaplar → Hesap Ekle → Diğer → Abone Olunan Takvim Ekle → URL gir

### Android  
Google Calendar → Diğer takvimler → URL'den → URL gir

## Kurulum

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend + Electron
```bash
cd frontend
npm install
npm run electron:dev   # Geliştirme
npm run electron:build # Mac/Windows dağıtım
```

## Ölçekleme Stratejisi (Ücretsiz → Ücretli)

1. **0-100 kullanıcı**: SQLite, tek sunucu, Hetzner CX11 €4/ay
2. **100-1000 kullanıcı**: PostgreSQL, Hetzner CX21 €8/ay  
3. **1000+ kullanıcı**: PostgreSQL + connection pooling (PgBouncer), €20/ay
4. **10000+**: Read replicas, Redis cache, load balancer

## Design Patterns Kullanılanlar

- **Repository Pattern**: Veri erişimini soyutlar, test edilebilir
- **Service Layer**: İş mantığını router'dan ayırır
- **DTO Pattern**: Pydantic schemas ile input/output validasyonu
- **Observer Pattern**: Event bus ile modüller arası iletişim
- **Factory Pattern**: Model oluşturma mantığını merkezileştirir
- **Singleton**: Database bağlantısı
- **Middleware Chain**: Auth → Rate limit → Security headers
