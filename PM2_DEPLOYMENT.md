# 🚀 RentCar - PM2 bilan Deploy Qilish

PM2 - Node.js process manager. Backend va Frontend ni boshqarish uchun ishlatiladi.

## 📦 1. PM2 O'rnatish

```bash
# Node.js va npm o'rnatilganligini tekshiring
node --version
npm --version

# PM2 ni global o'rnatish
npm install -g pm2

# PM2 versiyasini tekshirish
pm2 --version
```

## 🚀 2. Loyihani Tayyorlash

### Fayllarni Serverga Yuklash

```bash
# Lokal kompyuterdan
scp -r /path/to/rentcar root@your_server_ip:/var/www/
```

### Backend Tayyorlash

```bash
cd /var/www/rentcar

# Virtual environment yaratish
python3 -m venv venv
source venv/bin/activate

# Kutubxonalarni o'rnatish
pip install -r requirements.txt
pip install gunicorn

# Ma'lumotlar bazasini yaratish
python init_project.py
```

### Frontend Tayyorlash

```bash
cd /var/www/rentcar/frontend

# Dependencies o'rnatish
npm install

# Production build
npm run build
```

### Logs Papkasini Yaratish

```bash
mkdir -p /var/www/rentcar/logs
```

## 🎯 3. PM2 bilan Ishga Tushirish

### Variant A: Ecosystem File bilan (Tavsiya etiladi)

```bash
cd /var/www/rentcar

# PM2 ecosystem file bilan ishga tushirish
pm2 start ecosystem.config.js

# Statusni tekshirish
pm2 list
```

### Variant B: Qo'lda Ishga Tushirish

```bash
# Backend
pm2 start /var/www/rentcar/venv/bin/gunicorn \
  --name rentcar-backend \
  --cwd /var/www/rentcar \
  --interpreter none \
  -- --workers 4 --bind 127.0.0.1:5000 --timeout 120 app:app

# Frontend
pm2 start npm \
  --name rentcar-frontend \
  --cwd /var/www/rentcar/frontend \
  -- start
```

## 📊 4. PM2 Boshqarish Buyruqlari

### Statusni Ko'rish

```bash
# Barcha processlarni ko'rish
pm2 list

# Batafsil ma'lumot
pm2 show rentcar-backend
pm2 show rentcar-frontend

# Real-time monitoring
pm2 monit
```

### Loglarni Ko'rish

```bash
# Barcha loglar
pm2 logs

# Backend loglari
pm2 logs rentcar-backend

# Frontend loglari
pm2 logs rentcar-frontend

# Oxirgi 100 qator
pm2 logs --lines 100

# Real-time logs
pm2 logs --raw
```

### Processlarni Boshqarish

```bash
# To'xtatish
pm2 stop rentcar-backend
pm2 stop rentcar-frontend
pm2 stop all

# Qayta ishga tushirish
pm2 restart rentcar-backend
pm2 restart rentcar-frontend
pm2 restart all

# Reload (zero-downtime)
pm2 reload rentcar-backend
pm2 reload rentcar-frontend

# O'chirish
pm2 delete rentcar-backend
pm2 delete rentcar-frontend
pm2 delete all
```

## 🔄 5. Avtomatik Ishga Tushirish (Startup)

Server qayta ishga tushganda PM2 avtomatik ishga tushishi uchun:

```bash
# Startup script yaratish
pm2 startup

# Buyruqni ko'chirib ishga tushiring (PM2 ko'rsatadi)
# Masalan:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root

# Hozirgi processlarni saqlash
pm2 save

# Tekshirish
pm2 list
```

## 🌐 6. Nginx Konfiguratsiyasi

PM2 bilan ishlash uchun Nginx konfiguratsiyasi:

```bash
sudo nano /etc/nginx/sites-available/rentcar
```

```nginx
# Backend API
server {
    listen 80;
    server_name api.your-domain.com;
    
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }
    
    location /uploads {
        alias /var/www/rentcar/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# Frontend
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Nginx ni qayta ishga tushirish
sudo ln -s /etc/nginx/sites-available/rentcar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 7. SSL Sertifikat

```bash
# Certbot o'rnatish
sudo apt install -y certbot python3-certbot-nginx

# SSL sertifikat olish
sudo certbot --nginx -d your-domain.com -d www.your-domain.com -d api.your-domain.com
```

## 🔄 8. Yangilash (Update)

Loyihani yangilash uchun:

```bash
cd /var/www/rentcar

# Git orqali yangilanishlarni olish (agar Git ishlatilsa)
git pull origin main

# Backend yangilash
source venv/bin/activate
pip install -r requirements.txt

# Frontend yangilash
cd frontend
npm install
npm run build

# PM2 ni qayta ishga tushirish
pm2 restart all

# Yoki ecosystem file bilan
pm2 reload ecosystem.config.js
```

## 📊 9. Monitoring va Logs

### PM2 Plus (ixtiyoriy)

PM2 Plus - web-based monitoring:

```bash
# PM2 Plus ga ro'yxatdan o'tish
pm2 plus

# Yoki
pm2 link <secret_key> <public_key>
```

### Log Rotation

Loglar hajmi oshib ketmasligi uchun:

```bash
# PM2 log rotate moduli o'rnatish
pm2 install pm2-logrotate

# Sozlamalar
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### Custom Logs

```bash
# Backend loglari
tail -f /var/www/rentcar/logs/backend-out.log
tail -f /var/www/rentcar/logs/backend-error.log

# Frontend loglari
tail -f /var/www/rentcar/logs/frontend-out.log
tail -f /var/www/rentcar/logs/frontend-error.log
```

## 🛠️ 10. Muammolarni Hal Qilish

### PM2 Processlar Ishlamayapti

```bash
# Statusni tekshirish
pm2 list

# Loglarni ko'rish
pm2 logs --err

# Qayta ishga tushirish
pm2 restart all

# Agar yordam bermasa, o'chirib qayta boshlash
pm2 delete all
pm2 start ecosystem.config.js
```

### Backend Xatolari

```bash
# Backend loglarini ko'rish
pm2 logs rentcar-backend --lines 100

# Ma'lumotlar bazasini tekshirish
cd /var/www/rentcar
source venv/bin/activate
python check_database.py

# .env faylini tekshirish
cat .env
```

### Frontend Xatolari

```bash
# Frontend loglarini ko'rish
pm2 logs rentcar-frontend --lines 100

# Build qayta qilish
cd /var/www/rentcar/frontend
npm run build

# PM2 ni qayta ishga tushirish
pm2 restart rentcar-frontend
```

### Port Band

```bash
# Portlarni tekshirish
sudo netstat -tulpn | grep :5000
sudo netstat -tulpn | grep :3000

# Agar band bo'lsa, processni to'xtatish
sudo kill -9 <PID>
```

## 📋 11. PM2 Cheat Sheet

```bash
# Ishga tushirish
pm2 start ecosystem.config.js
pm2 start app.js --name my-app

# Boshqarish
pm2 list                    # Barcha processlar
pm2 show <app_name>         # Batafsil ma'lumot
pm2 monit                   # Real-time monitoring
pm2 logs                    # Barcha loglar
pm2 logs <app_name>         # Bitta app loglari

# Restart/Reload
pm2 restart <app_name>      # Restart
pm2 reload <app_name>       # Zero-downtime reload
pm2 stop <app_name>         # To'xtatish
pm2 delete <app_name>       # O'chirish

# Cluster mode
pm2 start app.js -i max     # CPU cores soni bo'yicha
pm2 scale <app_name> 4      # 4 ta instance

# Startup
pm2 startup                 # Startup script
pm2 save                    # Hozirgi holatni saqlash
pm2 resurrect               # Saqlangan holatni tiklash

# Update
pm2 update                  # PM2 ni yangilash
pm2 reset <app_name>        # Statistikani reset qilish
```

## ✅ 12. Deploy Tekshiruvi

Deploy muvaffaqiyatli bo'lganini tekshirish:

```bash
# PM2 statusini tekshirish
pm2 list

# Natija:
# ┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
# │ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
# ├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
# │ 0  │ rentcar-backend    │ fork     │ 0    │ online    │ 0%       │ 50.0mb   │
# │ 1  │ rentcar-frontend   │ fork     │ 0    │ online    │ 0%       │ 80.0mb   │
# └────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘

# API ni tekshirish
curl http://localhost:5000/api/health

# Frontend ni tekshirish
curl http://localhost:3000

# Brauzerda ochish
https://your-domain.com
https://api.your-domain.com/api/health
```

---

## 🎉 Tayyor!

PM2 bilan loyiha muvaffaqiyatli deploy qilindi!

**Foydali havolalar:**
- PM2 Documentation: https://pm2.keymetrics.io/docs/usage/quick-start/
- PM2 Plus: https://app.pm2.io/

**Keyingi qadamlar:**
1. ✅ PM2 monitoring sozlang
2. ✅ Log rotation sozlang
3. ✅ Backup strategiyasini yarating
4. ✅ Monitoring va alerting sozlang

---

**Muvaffaqiyatli deploy! 🚀**
