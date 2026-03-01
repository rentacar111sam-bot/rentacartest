# 🚀 RentCar - Tezkor Deploy Yo'riqnomasi

## VPS ga Deploy Qilish (5 Daqiqa)

### 1️⃣ Serverga Ulanish
```bash
ssh root@your_server_ip
```

### 2️⃣ Loyihani Yuklash
```bash
# Lokal kompyuterdan (yangi terminal)
scp -r /path/to/rentcar root@your_server_ip:/root/
```

### 3️⃣ Deploy Skriptini Ishga Tushirish
```bash
# Serverda
cd /root/rentcar
chmod +x deploy.sh
./deploy.sh
```

Skript avtomatik ravishda:
- ✅ Sistema paketlarini o'rnatadi
- ✅ Python va Node.js o'rnatadi
- ✅ Ma'lumotlar bazasini yaratadi
- ✅ Frontend build qiladi
- ✅ Nginx sozlaydi
- ✅ SSL sertifikat o'rnatadi
- ✅ Firewall sozlaydi

### 4️⃣ .env Faylini Tahrirlash
```bash
nano /var/www/rentcar/.env
```

O'zgartirish kerak:
- `SECRET_KEY` - random string
- `JWT_SECRET_KEY` - random string
- `ADMIN_PASSWORD` - kuchli parol
- `your-domain.com` - o'z domeningiz

### 5️⃣ Tekshirish
```bash
# Services statusini tekshirish
sudo systemctl status rentcar-backend
sudo systemctl status rentcar-frontend

# Brauzerda ochish
https://your-domain.com
https://api.your-domain.com/api/health
```

---

## Qo'lda Deploy (Batafsil)

### 1. Sistema Tayyorlash
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv nginx git curl ufw
```

### 2. Node.js O'rnatish
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 3. Loyihani Joylashtirish
```bash
sudo mkdir -p /var/www/rentcar
cd /var/www/rentcar
# Fayllarni bu yerga ko'chiring
```

### 4. Backend Sozlash
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
python init_project.py
```

### 5. Frontend Build
```bash
cd frontend
npm install
npm run build
```

### 6. Systemd Services
```bash
# Backend
sudo cp systemd-backend.service /etc/systemd/system/rentcar-backend.service
sudo systemctl enable rentcar-backend
sudo systemctl start rentcar-backend

# Frontend
sudo cp systemd-frontend.service /etc/systemd/system/rentcar-frontend.service
sudo systemctl enable rentcar-frontend
sudo systemctl start rentcar-frontend
```

### 7. Nginx Sozlash
```bash
# Konfiguratsiyani ko'chirish
sudo cp nginx.conf /etc/nginx/sites-available/rentcar

# Domenni o'zgartirish
sudo nano /etc/nginx/sites-available/rentcar
# your-domain.com ni o'z domeningiz bilan almashtiring

# Faollashtirish
sudo ln -s /etc/nginx/sites-available/rentcar /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 8. SSL Sertifikat
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com -d api.your-domain.com
```

### 9. Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 10. Huquqlar
```bash
sudo chown -R www-data:www-data /var/www/rentcar
sudo chmod -R 755 /var/www/rentcar
sudo chmod -R 775 /var/www/rentcar/uploads
```

---

## Yangilash

```bash
cd /var/www/rentcar
chmod +x update.sh
./update.sh
```

---

## Foydali Buyruqlar

### Loglarni Ko'rish
```bash
# Backend
sudo journalctl -u rentcar-backend -f

# Frontend
sudo journalctl -u rentcar-frontend -f

# Nginx
sudo tail -f /var/log/nginx/error.log
```

### Services Boshqarish
```bash
# To'xtatish
sudo systemctl stop rentcar-backend rentcar-frontend

# Ishga tushirish
sudo systemctl start rentcar-backend rentcar-frontend

# Qayta ishga tushirish
sudo systemctl restart rentcar-backend rentcar-frontend

# Status
sudo systemctl status rentcar-backend rentcar-frontend
```

### Ma'lumotlar Bazasi
```bash
cd /var/www/rentcar
source venv/bin/activate
python check_database.py
```

---

## Muammolarni Hal Qilish

### Backend ishlamayapti
```bash
sudo systemctl status rentcar-backend
sudo journalctl -u rentcar-backend -n 100
```

### Frontend ishlamayapti
```bash
sudo systemctl status rentcar-frontend
sudo journalctl -u rentcar-frontend -n 100
cd /var/www/rentcar/frontend
npm run build
```

### Nginx xatolari
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Port band
```bash
sudo netstat -tulpn | grep :5000
sudo netstat -tulpn | grep :3000
```

---

## Xavfsizlik

1. ✅ `.env` faylidagi parollarni o'zgartiring
2. ✅ SSH port raqamini o'zgartiring (22 → 2222)
3. ✅ SSH parol autentifikatsiyasini o'chiring
4. ✅ Fail2ban o'rnating
5. ✅ Muntazam backup oling

---

**Muvaffaqiyatli deploy! 🎉**
