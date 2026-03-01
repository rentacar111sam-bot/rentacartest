# 🔄 VPS Serverda Loyihani Yangilash

## Tezkor Yangilash (1 Buyruq)

### SSH orqali serverga kirish
```bash
ssh root@your_server_ip
```

### Yangilash skriptini ishga tushirish
```bash
cd /var/www/rentcar
chmod +x update-vps.sh
./update-vps.sh
```

**Tayyor!** Loyiha yangilandi va qayta ishga tushdi! 🎉

---

## Qo'lda Yangilash (Batafsil)

Agar skript ishlamasa, quyidagi qadamlarni bajaring:

### 1. Serverga kirish
```bash
ssh root@your_server_ip
```

### 2. Loyiha papkasiga o'tish
```bash
cd /var/www/rentcar
```

### 3. Git'dan yangilanishlarni olish
```bash
git fetch origin
git pull origin main
```

### 4. Backend yangilash
```bash
# Virtual environment aktivlashtirish
source venv/bin/activate

# Dependencies yangilash
pip install -r requirements.txt --upgrade

# Database tekshirish
python check_database.py
```

### 5. Frontend yangilash
```bash
cd frontend

# Dependencies yangilash
npm install

# Production build
npm run build

cd ..
```

### 6. Servislarni qayta ishga tushirish

#### PM2 bilan:
```bash
pm2 restart all
pm2 save
pm2 list
```

#### Systemd bilan:
```bash
sudo systemctl restart rentcar-backend
sudo systemctl restart rentcar-frontend
sudo systemctl status rentcar-backend
sudo systemctl status rentcar-frontend
```

### 7. Tekshirish
```bash
# Backend health check
curl http://localhost:5000/api/health

# PM2 logs
pm2 logs --lines 50

# Systemd logs
sudo journalctl -u rentcar-backend -n 50
sudo journalctl -u rentcar-frontend -n 50
```

---

## Muammolarni Hal Qilish

### Backend ishlamayapti
```bash
# Loglarni ko'rish
pm2 logs rentcar-backend --lines 100

# Yoki systemd
sudo journalctl -u rentcar-backend -n 100

# Database ulanishini tekshirish
cd /var/www/rentcar
source venv/bin/activate
python check_database.py

# Qayta ishga tushirish
pm2 restart rentcar-backend
# yoki
sudo systemctl restart rentcar-backend
```

### Frontend ishlamayapti
```bash
# Loglarni ko'rish
pm2 logs rentcar-frontend --lines 100

# Build qayta qilish
cd /var/www/rentcar/frontend
npm run build

# Qayta ishga tushirish
pm2 restart rentcar-frontend
# yoki
sudo systemctl restart rentcar-frontend
```

### Git pull xatosi
```bash
# Local o'zgarishlarni bekor qilish
git reset --hard origin/main

# Qayta pull qilish
git pull origin main
```

### Port band
```bash
# Portni band qilgan processni topish
sudo lsof -i :5000
sudo lsof -i :3000

# Process'ni to'xtatish
sudo kill -9 <PID>

# Qayta ishga tushirish
pm2 restart all
```

---

## Avtomatik Yangilash (Cron Job)

Har kuni soat 3:00 da avtomatik yangilash:

```bash
# Crontab ochish
crontab -e

# Quyidagi qatorni qo'shish
0 3 * * * cd /var/www/rentcar && ./update-vps.sh >> /var/log/rentcar-update.log 2>&1
```

---

## Yangilanishdan Keyin Tekshirish

1. ✅ Frontend: https://your-domain.com
2. ✅ Backend: https://api.your-domain.com/api/health
3. ✅ Admin: https://your-domain.com/admin
4. ✅ PM2 Status: `pm2 list`
5. ✅ Logs: `pm2 logs`

---

## Backup Olish (Yangilashdan Oldin)

```bash
# Database backup
pg_dump $DATABASE_URL > /var/backups/rentcar-$(date +%Y%m%d).sql

# Fayllar backup
tar -czf /var/backups/rentcar-files-$(date +%Y%m%d).tar.gz /var/www/rentcar/uploads

# .env backup
cp /var/www/rentcar/.env /var/backups/rentcar-env-$(date +%Y%m%d).backup
```

---

## Rollback (Eski Versiyaga Qaytish)

Agar yangilanishda muammo bo'lsa:

```bash
# Oxirgi commit'ga qaytish
cd /var/www/rentcar
git log --oneline -5
git reset --hard <commit-hash>

# Servislarni qayta ishga tushirish
pm2 restart all
```

---

## Tezkor Buyruqlar

```bash
# Status
pm2 list

# Logs
pm2 logs

# Restart
pm2 restart all

# Stop
pm2 stop all

# Start
pm2 start all

# Monitoring
pm2 monit
```

---

**Muvaffaqiyatli yangilash! 🚀**
