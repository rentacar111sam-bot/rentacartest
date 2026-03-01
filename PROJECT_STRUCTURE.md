# 📁 RentCar - Loyiha Strukturasi

## Asosiy Fayllar

### Backend (Python Flask)
```
├── app.py                      # Flask ilovasi (asosiy fayl)
├── models.py                   # Ma'lumotlar bazasi modellari
├── security.py                 # Xavfsizlik funksiyalari
├── run.py                      # Server ishga tushirish
├── init_project.py             # Ma'lumotlar bazasini yaratish
├── check_database.py           # Database tekshirish
├── requirements.txt            # Python kutubxonalari
└── .env                        # Muhit o'zgaruvchilari
```

### Frontend (Next.js)
```
frontend/
├── app/                        # Next.js pages (App Router)
│   ├── page.tsx               # Bosh sahifa
│   ├── cars/                  # Mashinalar sahifasi
│   ├── booking/               # Bron qilish
│   ├── contact/               # Aloqa
│   └── admin/                 # Admin panel
├── components/                 # React komponentlar
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── CarCard.tsx
│   └── ...
├── lib/                        # Utility funksiyalar
│   ├── api.ts                 # API client
│   └── cache.ts               # Caching
├── types/                      # TypeScript types
│   └── index.ts
├── public/                     # Statik fayllar
├── package.json
└── .env.production            # Production sozlamalar
```

### API Routes
```
routes/
├── admin.py                    # Admin endpoints
├── auth.py                     # Autentifikatsiya
├── bookings.py                 # Bronlar CRUD
├── cars.py                     # Mashinalar CRUD
├── categories.py               # Kategoriyalar
├── contact.py                  # Xabarlar
├── telegram_admin.py           # Telegram admin
├── apk.py                      # APK endpoints
└── user.py                     # Foydalanuvchilar
```

### Utilities
```
utils/
├── telegram.py                 # Telegram bot integratsiyasi
└── file_upload.py              # Fayl yuklash va siqish
```

### Deploy Fayllari
```
├── deploy.sh                   # Avtomatik deploy skripti
├── update.sh                   # Yangilash skripti
├── nginx.conf                  # Nginx konfiguratsiyasi
├── systemd-backend.service     # Backend systemd service
├── systemd-frontend.service    # Frontend systemd service
├── .env.production             # Production environment
└── frontend/.env.production    # Frontend production env
```

### Dokumentatsiya
```
├── README.md                   # Asosiy yo'riqnoma
├── DEPLOY_README.md            # Deploy yo'riqnomalari
├── DEPLOY_QUICK.md             # Tezkor deploy (5 daqiqa)
├── VPS_DEPLOYMENT_GUIDE.md     # To'liq deploy yo'riqnomasi
├── DEPLOY_CHECKLIST.md         # Deploy tekshiruvi
└── PROJECT_STRUCTURE.md        # Bu fayl
```

## Papkalar

### uploads/
Foydalanuvchilar tomonidan yuklangan fayllar (rasmlar, hujjatlar)

### apk/
Android APK fayllari va sozlamalar

### __pycache__/
Python cache fayllari (avtomatik yaratiladi)

### .git/
Git version control

### .vscode/
VS Code sozlamalari

---

## Fayl Hajmlari

| Komponent | Taxminiy Hajm |
|-----------|---------------|
| Backend | ~50 MB |
| Frontend | ~200 MB (node_modules bilan) |
| Frontend Build | ~5 MB |
| Uploads | O'zgaruvchan |
| Jami (production) | ~60 MB |

---

## Texnologiyalar

### Backend
- Python 3.8+
- Flask 2.3+
- SQLAlchemy 2.0+
- PostgreSQL
- JWT Authentication
- Gunicorn (production)

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Axios

### Server
- Ubuntu 20.04+
- Nginx
- Systemd
- Let's Encrypt SSL

---

**Loyiha tozalangan va deploy uchun tayyor! 🚀**
