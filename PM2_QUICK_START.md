# ⚡ RentCar - PM2 Tezkor Yo'riqnoma

## 🚀 Tezkor Deploy (3 Qadam)

### 1. Fayllarni Serverga Yuklash
```bash
# Lokal kompyuterdan
scp -r /path/to/rentcar root@your_server_ip:/root/
```

### 2. Deploy Skriptini Ishga Tushirish
```bash
# Serverda
cd /root/rentcar
chmod +x deploy-pm2.sh
./deploy-pm2.sh
```

### 3. Tekshirish
```bash
pm2 list
```

**Tayyor!** 🎉

---

## 📊 Asosiy PM2 Buyruqlari

### Status va Monitoring
```bash
pm2 list                    # Barcha processlar
pm2 show rentcar-backend    # Batafsil ma'lumot
pm2 monit                   # Real-time monitoring
```

### Loglar
```bash
pm2 logs                    # Barcha loglar
pm2 logs rentcar-backend    # Backend loglari
pm2 logs rentcar-frontend   # Frontend loglari
pm2 logs --lines 100        # Oxirgi 100 qator
```

### Boshqarish
```bash
pm2 restart all             # Barchasini restart
pm2 restart rentcar-backend # Backend restart
pm2 reload all              # Zero-downtime reload
pm2 stop all                # To'xtatish
pm2 delete all              # O'chirish
```

---

## 🔄 Yangilash

```bash
cd /var/www/rentcar
chmod +x update-pm2.sh
./update-pm2.sh
```

---

## 🛠️ Muammolarni Hal Qilish

### Process Ishlamayapti
```bash
pm2 list                    # Statusni ko'rish
pm2 logs --err              # Xatolarni ko'rish
pm2 restart all             # Restart
```

### Backend Xatosi
```bash
pm2 logs rentcar-backend --lines 100
cd /var/www/rentcar
source venv/bin/activate
python check_database.py
```

### Frontend Xatosi
```bash
pm2 logs rentcar-frontend --lines 100
cd /var/www/rentcar/frontend
npm run build
pm2 restart rentcar-frontend
```

---

## 📍 Kirish Manzillari

- Frontend: `https://your-domain.com`
- Backend: `https://api.your-domain.com/api/health`
- Admin: `https://your-domain.com/admin`

---

## 🔐 Admin Ma'lumotlari

- Username: `admin`
- Password: `101110`

---

## 📚 Batafsil Yo'riqnoma

`PM2_DEPLOYMENT.md` faylini o'qing.

---

**Muvaffaqiyatli deploy! 🚀**
