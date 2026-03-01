# 🚗 RentCar - Avtomobil Ijarasi Tizimi

Professional avtomobil ijarasi veb-sayt loyihasi Python Flask backend va Next.js frontend bilan.

## ✨ Xususiyatlar

- **Modern texnologiyalar**: Next.js 14, TypeScript, Tailwind CSS, Python Flask
- **Responsive dizayn** - barcha qurilmalarda ishlaydi
- **3 bosqichli bron qilish jarayoni**
- **Xavfsiz fayl yuklash va rasm siqish**
- **Telegram bot integratsiyasi**
- **Admin panel** - mashinalar va bronlarni boshqarish
- **JWT autentifikatsiya**
- **PostgreSQL ma'lumotlar bazasi**

## 📋 Talablar

- **Python** 3.8+
- **Node.js** 16+
- **PostgreSQL** (Supabase yoki lokal)

## 🚀 Lokal Ishga Tushirish

### 1. Loyihani Klonlash
```bash
git clone <repository-url>
cd rentcar
```

### 2. Backend Sozlash
```bash
# Python kutubxonalarini o'rnatish
python -m pip install -r requirements.txt

# Ma'lumotlar bazasini yaratish
python init_project.py

# Backend serverni ishga tushirish
python run.py
```

Backend: http://localhost:5000

### 3. Frontend Sozlash
```bash
# Yangi terminal ochib
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:3000

## 🌐 Kirish Manzillari

| Sahifa | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Admin Panel | http://localhost:3000/admin |
| Backend API | http://localhost:5000/api |
| API Health | http://localhost:5000/api/health |

## 🔐 Admin Ma'lumotlari

- **Username**: `admin`
- **Password**: `101110`

## 📁 Loyiha Tuzilishi

```
rentcar/
├── app.py                      # Flask ilovasi
├── models.py                   # Ma'lumotlar bazasi modellari
├── requirements.txt            # Python kutubxonalari
├── run.py                      # Server ishga tushirish
├── init_project.py             # DB yaratish
├── security.py                 # Xavfsizlik funksiyalari
├── .env                        # Muhit o'zgaruvchilari
├── check_database.py           # DB tekshirish
├── routes/                     # API yo'nalishlari
│   ├── admin.py               # Admin endpoints
│   ├── auth.py                # Autentifikatsiya
│   ├── bookings.py            # Bronlar
│   ├── cars.py                # Mashinalar
│   ├── categories.py          # Kategoriyalar
│   ├── contact.py             # Xabarlar
│   ├── telegram_admin.py      # Telegram admin
│   ├── apk.py                 # APK endpoints
│   └── user.py                # Foydalanuvchilar
├── utils/                      # Yordamchi funksiyalar
│   ├── telegram.py            # Telegram bot
│   └── file_upload.py         # Fayl yuklash
├── uploads/                    # Yuklangan fayllar
└── frontend/                   # Next.js frontend
    ├── app/                   # Next.js pages
    ├── components/            # React komponentlar
    ├── lib/                   # Utility funksiyalar
    ├── types/                 # TypeScript types
    └── public/                # Statik fayllar
```

## ⚙️ Sozlamalar

`.env` faylida muhim sozlamalar:

```env
# Ma'lumotlar bazasi
DATABASE_URL=postgresql://...

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=101110

# Xavfsizlik
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=jwt-secret-key
```

## 🔧 Asosiy API Endpoints

### Mashinalar
- `GET /api/cars` - Barcha mashinalar
- `GET /api/cars?id=1` - Bitta mashina
- `POST /api/cars` - Yangi mashina (admin)
- `DELETE /api/cars/{id}` - Mashinani o'chirish (admin)

### Bronlar
- `GET /api/bookings` - Barcha bronlar
- `POST /api/bookings` - Yangi bron
- `PUT /api/bookings/{id}` - Bron statusini yangilash

### Autentifikatsiya
- `POST /api/auth/login` - Admin kirish
- `GET /api/auth/me` - Joriy foydalanuvchi

## 🚀 VPS ga Deploy Qilish

### Variant 1: Systemd bilan Deploy

```bash
# 1. Fayllarni serverga yuklash
scp -r /path/to/rentcar root@your_server_ip:/root/

# 2. Serverda deploy skriptini ishga tushirish
cd /root/rentcar
chmod +x deploy.sh
./deploy.sh
```

**Yo'riqnomalar:**
- `DEPLOY_QUICK.md` - Tezkor deploy (5 daqiqa)
- `VPS_DEPLOYMENT_GUIDE.md` - To'liq yo'riqnoma
- `DEPLOY_CHECKLIST.md` - Tekshirish ro'yxati

### Variant 2: PM2 bilan Deploy (Tavsiya etiladi)

```bash
# 1. Fayllarni serverga yuklash
scp -r /path/to/rentcar root@your_server_ip:/root/

# 2. PM2 deploy skriptini ishga tushirish
cd /root/rentcar
chmod +x deploy-pm2.sh
./deploy-pm2.sh
```

**PM2 Yo'riqnomalar:**
- `PM2_QUICK_START.md` - Tezkor boshlash
- `PM2_DEPLOYMENT.md` - To'liq yo'riqnoma
- `ecosystem.config.js` - PM2 konfiguratsiya

**PM2 Buyruqlari:**
```bash
pm2 list                    # Status
pm2 logs                    # Loglar
pm2 restart all             # Restart
pm2 monit                   # Monitoring
```

## 🛠️ Foydali Skriptlar

```bash
# Ma'lumotlar bazasini tekshirish
python check_database.py

# Loyihani yangilash (VPS da)
./update.sh

# Backend serverni ishga tushirish
python run.py

# Frontend serverni ishga tushirish
cd frontend && npm run dev
```

## 📞 Yordam

Muammolar yuzaga kelsa:
- `DEPLOY_CHECKLIST.md` - Deploy tekshiruvi
- GitHub Issues - Muammolarni xabar qilish