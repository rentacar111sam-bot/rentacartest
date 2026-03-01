# 📋 RentCar Deploy Checklist

Deploy qilishdan oldin tekshirish kerak bo'lgan narsalar ro'yxati.

## ✅ Pre-Deploy Checklist

### 1. Fayllar Tayyorligi
- [ ] `.env.production` fayli to'ldirilgan
- [ ] `frontend/.env.production` fayli to'ldirilgan
- [ ] Barcha parollar o'zgartirilgan
- [ ] Domen nomlari to'g'ri kiritilgan
- [ ] Telegram bot sozlamalari to'g'ri

### 2. VPS Server Talablari
- [ ] Ubuntu 20.04+ o'rnatilgan
- [ ] Root yoki sudo huquqlari bor
- [ ] SSH orqali kirish mumkin
- [ ] Kamida 2GB RAM
- [ ] Kamida 20GB disk space

### 3. Domen Sozlamalari
- [ ] Domen sotib olingan
- [ ] DNS A record: `your-domain.com` → `server_ip`
- [ ] DNS A record: `www.your-domain.com` → `server_ip`
- [ ] DNS A record: `api.your-domain.com` → `server_ip`
- [ ] DNS propagation tugagan (24 soat kutish)

### 4. Ma'lumotlar Bazasi
- [ ] PostgreSQL (Supabase) ulanish ma'lumotlari to'g'ri
- [ ] Database URL `.env` faylida to'g'ri
- [ ] Ma'lumotlar bazasi internetdan kirish mumkin

### 5. Telegram Bot
- [ ] Bot yaratilgan (@BotFather)
- [ ] Bot token olingan
- [ ] Chat ID olingan
- [ ] Bot sozlamalari `.env` faylida

---

## 📦 Deploy Qilish Uchun Kerakli Fayllar

### Backend Fayllari
```
rentcar/
├── app.py
├── models.py
├── requirements.txt
├── run.py
├── init_project.py
├── security.py
├── .env (production sozlamalar bilan)
├── routes/
│   ├── admin.py
│   ├── auth.py
│   ├── bookings.py
│   ├── cars.py
│   ├── categories.py
│   ├── contact.py
│   ├── telegram_admin.py
│   ├── apk.py
│   └── user.py
└── utils/
    ├── telegram.py
    └── file_upload.py
```

### Frontend Fayllari
```
frontend/
├── app/
├── components/
├── lib/
├── types/
├── public/
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── .env.production (production sozlamalar bilan)
```

### Deploy Skriptlari
```
├── deploy.sh (avtomatik deploy)
├── update.sh (yangilash)
├── nginx.conf (Nginx konfiguratsiyasi)
├── systemd-backend.service
├── systemd-frontend.service
└── VPS_DEPLOYMENT_GUIDE.md
```

---

## 🚀 Deploy Jarayoni

### Variant 1: Avtomatik Deploy (Tavsiya etiladi)

1. **Fayllarni Serverga Yuklash**
```bash
# Lokal kompyuterdan
scp -r /path/to/rentcar root@your_server_ip:/root/
```

2. **Deploy Skriptini Ishga Tushirish**
```bash
# Serverda
cd /root/rentcar
chmod +x deploy.sh
./deploy.sh
```

3. **Domenni Kiritish**
- Skript so'raganda domeningizni kiriting
- Masalan: `rentcar.uz`

4. **SSL Sertifikat**
- Skript so'raganda `y` bosing
- Email manzilingizni kiriting

5. **Tekshirish**
- Frontend: `https://your-domain.com`
- Backend: `https://api.your-domain.com/api/health`
- Admin: `https://your-domain.com/admin`

### Variant 2: Qo'lda Deploy

`DEPLOY_QUICK.md` faylidagi "Qo'lda Deploy" bo'limiga qarang.

---

## 🔍 Post-Deploy Tekshirish

### 1. Services Ishlayaptimi?
```bash
sudo systemctl status rentcar-backend
sudo systemctl status rentcar-frontend
sudo systemctl status nginx
```

### 2. API Ishlayaptimi?
```bash
curl https://api.your-domain.com/api/health
```

Javob:
```json
{"status":"healthy","timestamp":"2024-..."}
```

### 3. Frontend Ochilayaptimi?
Brauzerda: `https://your-domain.com`

### 4. Admin Panel Ishlayaptimi?
Brauzerda: `https://your-domain.com/admin`
- Username: `admin`
- Password: `.env` faylidagi parol

### 5. Mashinalar Ko'rinayaptimi?
Brauzerda: `https://your-domain.com/cars`

### 6. Bron Qilish Ishlayaptimi?
- Mashinani tanlang
- Bron qilish formasini to'ldiring
- Telegram botga xabar kelishini tekshiring

### 7. Rasm Yuklash Ishlayaptimi?
- Admin panelga kiring
- Yangi mashina qo'shing
- Rasm yuklang
- Rasm ko'rinishini tekshiring

---

## 🔒 Xavfsizlik Tekshiruvi

### 1. Parollar O'zgartirilganmi?
- [ ] `.env` → `SECRET_KEY`
- [ ] `.env` → `JWT_SECRET_KEY`
- [ ] `.env` → `ADMIN_PASSWORD`

### 2. HTTPS Ishlayaptimi?
- [ ] `https://your-domain.com` ochiladi
- [ ] `http://your-domain.com` → `https://` ga redirect qiladi
- [ ] SSL sertifikat to'g'ri

### 3. Firewall Sozlanganmi?
```bash
sudo ufw status
```

Ochiq portlar:
- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)

### 4. CORS Sozlanganmi?
`.env` faylidagi `CORS_ORIGINS` to'g'ri domenlar bilan to'ldirilgan.

---

## 📊 Monitoring

### Loglarni Kuzatish
```bash
# Backend
sudo journalctl -u rentcar-backend -f

# Frontend
sudo journalctl -u rentcar-frontend -f

# Nginx
sudo tail -f /var/log/nginx/error.log
```

### Disk Space
```bash
df -h
```

### Memory Usage
```bash
free -h
```

### CPU Usage
```bash
top
```

---

## 🔄 Backup

### Ma'lumotlar Bazasi Backup
```bash
# PostgreSQL (Supabase) - avtomatik backup bor
# Qo'shimcha backup kerak bo'lsa:
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Fayllar Backup
```bash
# Uploads papkasi
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /var/www/rentcar/uploads

# .env fayl
cp /var/www/rentcar/.env /root/env_backup_$(date +%Y%m%d)
```

---

## 🆘 Muammolar va Yechimlar

### Backend ishlamayapti
```bash
sudo systemctl status rentcar-backend
sudo journalctl -u rentcar-backend -n 100
```

### Frontend ishlamayapti
```bash
sudo systemctl status rentcar-frontend
sudo journalctl -u rentcar-frontend -n 100
```

### 502 Bad Gateway
- Backend serverni tekshiring
- Nginx konfiguratsiyasini tekshiring
- Portlar ochiqligini tekshiring

### SSL Sertifikat Xatosi
```bash
sudo certbot renew
sudo systemctl restart nginx
```

### Ma'lumotlar Bazasi Ulanmayapti
- Internet ulanishini tekshiring
- Database URL to'g'riligini tekshiring
- Firewall sozlamalarini tekshiring

---

## 📞 Yordam

Qo'shimcha yordam kerak bo'lsa:
- `VPS_DEPLOYMENT_GUIDE.md` - batafsil yo'riqnoma
- `DEPLOY_QUICK.md` - tezkor yo'riqnoma
- `TROUBLESHOOTING.md` - muammolarni hal qilish

---

**Muvaffaqiyatli deploy! 🎉**
