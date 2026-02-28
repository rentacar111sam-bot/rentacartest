# RentCar - Avtomobil Ijarasi Tizimi

Professional avtomobil ijarasi veb-sayt loyihasi Python Flask backend va Next.js frontend bilan.

## 🚀 Xususiyatlar

- **Modern texnologiyalar**: Next.js 14, TypeScript, Tailwind CSS, Python Flask
- **Responsive dizayn** - barcha qurilmalarda ishlaydi
- **3 bosqichli bron qilish jarayoni**
- **Xavfsiz fayl yuklash tizimi**
- **Telegram bot integratsiyasi**
- **Admin panel**
- **JWT autentifikatsiya**

## 📋 Talablar

### Backend uchun:
- Python 3.8+
- pip

### Frontend uchun:
- Node.js 16+
- npm yoki yarn

## 🛠️ O'rnatish

### 1. Loyihani klonlash
```bash
git clone <repository-url>
cd rentcar
```

### 2. Backend o'rnatish va ishga tushirish

#### Avtomatik usul:
```bash
python start.py
```

#### Qo'lda o'rnatish:
```bash
# Virtual environment yaratish (ixtiyoriy)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# yoki
venv\Scripts\activate  # Windows

# Kutubxonalarni o'rnatish
pip install -r requirements.txt

# Ma'lumotlar bazasini sozlash
python run.py init-db

# Serverni ishga tushirish
python run.py
```

### 3. Frontend o'rnatish va ishga tushirish

Yangi terminal ochib:
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Kirish manzillari

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Bron qilish**: http://localhost:3000/booking?car=1
- **Mashinalar**: http://localhost:3000/cars

## 👤 Admin ma'lumotlari

- **Username**: admin
- **Password**: admin123

## 📁 Loyiha tuzilishi

```
rentcar/
├── app.py                 # Flask ilovasi
├── models.py             # Ma'lumotlar bazasi modellari
├── requirements.txt      # Python kutubxonalari
├── start.py             # Ishga tushirish skripti
├── .env                 # Muhit o'zgaruvchilari
├── routes/              # API yo'nalishlari
│   ├── cars.py
│   ├── bookings.py
│   ├── contact.py
│   ├── admin.py
│   └── auth.py
├── utils/               # Yordamchi funksiyalar
│   ├── telegram.py
│   └── file_upload.py
├── uploads/             # Yuklangan fayllar
└── frontend/            # Next.js frontend
    ├── app/
    ├── components/
    ├── lib/
    └── types/
```

## ⚙️ Sozlamalar

`.env` faylida quyidagi sozlamalarni o'zgartiring:

```env
# Ma'lumotlar bazasi
DATABASE_URL=sqlite:///rentcar.db

# Telegram Bot
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
TELEGRAM_CHAT_ID=YOUR_CHAT_ID_HERE

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Xavfsizlik
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=jwt-secret-key-here
```

## 🔧 API Endpoints

### Cars
- `GET /api/cars` - Barcha mashinalar
- `GET /api/cars?id=1` - Bitta mashina
- `POST /api/cars` - Yangi mashina (admin)
- `PUT /api/cars/{id}` - Mashinani yangilash (admin)
- `DELETE /api/cars/{id}` - Mashinani o'chirish (admin)

### Bookings
- `GET /api/bookings` - Barcha bronlar
- `POST /api/bookings` - Yangi bron
- `PUT /api/bookings/{id}` - Bron statusini yangilash
- `DELETE /api/bookings/{id}` - Bronni o'chirish

### Contact
- `POST /api/contact` - Xabar yuborish
- `GET /api/contact` - Xabarlar ro'yxati (admin)

### Auth
- `POST /api/auth/login` - Kirish
- `GET /api/auth/me` - Joriy foydalanuvchi
- `POST /api/auth/change-password` - Parolni o'zgartirish

## 📱 Telegram Bot sozlash

1. @BotFather ga murojaat qiling
2. `/newbot` buyrug'i bilan yangi bot yarating
3. Bot tokenini `.env` fayliga qo'shing
4. Chat ID ni olish uchun botga xabar yuboring va quyidagi URL ga kiring:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```

## 🚀 Production uchun

### Backend
```bash
# Gunicorn o'rnatish
pip install gunicorn

# Serverni ishga tushirish
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

## 🤝 Hissa qo'shish

1. Fork qiling
2. Feature branch yarating (`git checkout -b feature/AmazingFeature`)
3. O'zgarishlarni commit qiling (`git commit -m 'Add some AmazingFeature'`)
4. Branch ga push qiling (`git push origin feature/AmazingFeature`)
5. Pull Request oching

## 📄 Litsenziya

Bu loyiha MIT litsenziyasi ostida tarqatiladi.

## 📞 Yordam

Savollar yoki muammolar bo'lsa, issue oching yoki quyidagi manzilga murojaat qiling:
- Email: support@rentcar.uz
- Telegram: @rentcar_support