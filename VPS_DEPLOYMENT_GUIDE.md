# RentCar - VPS ga Deploy Qilish Yo'riqnomasi

Bu yo'riqnoma loyihani toza Ubuntu VPS serverga deploy qilish uchun to'liq qadamlarni o'z ichiga oladi.

## 📋 Talablar

- Ubuntu 20.04+ VPS server
- Root yoki sudo huquqlari
- Domen nomi (ixtiyoriy, lekin tavsiya etiladi)
- SSH orqali serverga kirish

## 🚀 1-Qadam: Serverga Ulanish

```bash
ssh root@your_server_ip
# yoki
ssh username@your_server_ip
```

## 📦 2-Qadam: Sistema Yangilanishlar

```bash
# Sistema paketlarini yangilash
sudo apt update && sudo apt upgrade -y

# Kerakli paketlarni o'rnatish
sudo apt install -y python3 python3-pip python3-venv nginx git curl
```

## 🔧 3-Qadam: Node.js O'rnatish

```bash
# Node.js 18.x o'rnatish
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Versiyani tekshirish
node --version
npm --version
```

## 📁 4-Qadam: Loyihani Klonlash

```bash
# Loyiha uchun papka yaratish
sudo mkdir -p /var/www/rentcar
cd /var/www/rentcar

# Git orqali klonlash (agar GitHub'da bo'lsa)
# sudo git clone https://github.com/username/rentcar.git .

# Yoki fayllarni yuklash (SFTP/SCP orqali)
# Lokal kompyuterdan:
# scp -r /path/to/rentcar/* username@server_ip:/var/www/rentcar/
```

## 🐍 5-Qadam: Backend Sozlash

```bash
cd /var/www/rentcar

# Virtual environment yaratish
python3 -m venv venv
source venv/bin/activate

# Python kutubxonalarini o'rnatish
pip install -r requirements.txt

# Gunicorn o'rnatish (production server)
pip install gunicorn
```

## ⚙️ 6-Qadam: .env Faylini Sozlash

```bash
# .env faylini tahrirlash
nano .env
```

`.env` fayl mazmuni:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres.xdnslxpwazjwllofpjsb:44881134n11@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres

# Flask Configuration
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-change-this-in-production
JWT_SECRET_KEY=jwt-super-secret-key-change-this-in-production
JWT_ACCESS_TOKEN_EXPIRES=3600

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=8591469050:AAH2clhL7RZEApSV8lcln-nwNb3n-oddXOI
TELEGRAM_CHAT_ID=8545405147
TELEGRAM_ADMIN_CHAT_ID=6002506071

# File Upload Configuration
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=5242880
UPLOAD_URL=https://your-domain.com/uploads
ALLOWED_EXTENSIONS=jpg,jpeg,png,pdf

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=101110

# Security Configuration
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
RATE_LIMIT_ENABLED=true

# Site Configuration
SITE_URL=https://your-domain.com
SITE_NAME=RentCar
```

**MUHIM:** `your-domain.com` ni o'z domeningiz bilan almashtiring!

## 🗄️ 7-Qadam: Ma'lumotlar Bazasini Ishga Tushirish

```bash
# Virtual environment faollashtirilganligiga ishonch hosil qiling
source venv/bin/activate

# Ma'lumotlar bazasini yaratish
python init_project.py
```

## 🎨 8-Qadam: Frontend Build Qilish

```bash
cd /var/www/rentcar/frontend

# Dependencies o'rnatish
npm install

# Production build
npm run build

# Build muvaffaqiyatli bo'lganini tekshirish
ls -la .next
```

## 🔧 9-Qadam: Systemd Service Yaratish (Backend)

Backend uchun systemd service yaratamiz:

```bash
sudo nano /etc/systemd/system/rentcar-backend.service
```

Quyidagi konfiguratsiyani kiriting:

```ini
[Unit]
Description=RentCar Backend API
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/var/www/rentcar
Environment="PATH=/var/www/rentcar/venv/bin"
ExecStart=/var/www/rentcar/venv/bin/gunicorn --workers 4 --bind 127.0.0.1:5000 --timeout 120 app:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Service ni ishga tushirish:

```bash
sudo systemctl daemon-reload
sudo systemctl enable rentcar-backend
sudo systemctl start rentcar-backend
sudo systemctl status rentcar-backend
```

## 🎨 10-Qadam: Systemd Service Yaratish (Frontend)

Frontend uchun systemd service yaratamiz:

```bash
sudo nano /etc/systemd/system/rentcar-frontend.service
```

Quyidagi konfiguratsiyani kiriting:

```ini
[Unit]
Description=RentCar Frontend
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/rentcar/frontend
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Service ni ishga tushirish:

```bash
sudo systemctl daemon-reload
sudo systemctl enable rentcar-frontend
sudo systemctl start rentcar-frontend
sudo systemctl status rentcar-frontend
```

## 🌐 11-Qadam: Nginx Konfiguratsiyasi

Nginx konfiguratsiya faylini yaratish:

```bash
sudo nano /etc/nginx/sites-available/rentcar
```

Quyidagi konfiguratsiyani kiriting:

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

**MUHIM:** `your-domain.com` ni o'z domeningiz bilan almashtiring!

Nginx konfiguratsiyasini faollashtirish:

```bash
# Konfiguratsiyani faollashtirish
sudo ln -s /etc/nginx/sites-available/rentcar /etc/nginx/sites-enabled/

# Default konfiguratsiyani o'chirish (ixtiyoriy)
sudo rm /etc/nginx/sites-enabled/default

# Nginx konfiguratsiyasini tekshirish
sudo nginx -t

# Nginx ni qayta ishga tushirish
sudo systemctl restart nginx
```

## 🔒 12-Qadam: SSL Sertifikat (Let's Encrypt)

```bash
# Certbot o'rnatish
sudo apt install -y certbot python3-certbot-nginx

# SSL sertifikat olish
sudo certbot --nginx -d your-domain.com -d www.your-domain.com -d api.your-domain.com

# Avtomatik yangilanishni tekshirish
sudo certbot renew --dry-run
```

## 📂 13-Qadam: Fayllar Huquqlarini Sozlash

```bash
# Loyiha papkasiga huquqlar berish
sudo chown -R www-data:www-data /var/www/rentcar
sudo chmod -R 755 /var/www/rentcar

# Uploads papkasiga yozish huquqi
sudo chmod -R 775 /var/www/rentcar/uploads
```

## 🔥 14-Qadam: Firewall Sozlash

```bash
# UFW firewall o'rnatish va sozlash
sudo apt install -y ufw

# SSH, HTTP, HTTPS portlarini ochish
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'

# Firewall ni yoqish
sudo ufw enable

# Statusni tekshirish
sudo ufw status
```

## ✅ 15-Qadam: Deploy Tekshirish

Quyidagi manzillarni brauzerda ochib tekshiring:

- Frontend: `https://your-domain.com`
- Backend API: `https://api.your-domain.com/api/health`
- Admin Panel: `https://your-domain.com/admin`

## 📊 Monitoring va Loglar

### Backend loglari:
```bash
sudo journalctl -u rentcar-backend -f
```

### Frontend loglari:
```bash
sudo journalctl -u rentcar-frontend -f
```

### Nginx loglari:
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔄 Yangilanishlar Deploy Qilish

Loyihani yangilash uchun:

```bash
cd /var/www/rentcar

# Git orqali yangilanishlarni olish
sudo git pull origin main

# Backend yangilash
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart rentcar-backend

# Frontend yangilash
cd frontend
npm install
npm run build
sudo systemctl restart rentcar-frontend
```

## 🛠️ Muammolarni Hal Qilish

### Backend ishlamayapti:
```bash
sudo systemctl status rentcar-backend
sudo journalctl -u rentcar-backend -n 50
```

### Frontend ishlamayapti:
```bash
sudo systemctl status rentcar-frontend
sudo journalctl -u rentcar-frontend -n 50
```

### Nginx xatolari:
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Ma'lumotlar bazasi muammolari:
```bash
cd /var/www/rentcar
source venv/bin/activate
python check_database.py
```

## 🔐 Xavfsizlik Tavsiyalari

1. `.env` faylidagi parollarni o'zgartiring
2. SSH port raqamini o'zgartiring
3. SSH parol autentifikatsiyasini o'chiring (faqat SSH key)
4. Fail2ban o'rnating
5. Muntazam backup oling

## 📞 Yordam

Muammolar yuzaga kelsa:
- Loglarni tekshiring
- Firewall sozlamalarini tekshiring
- DNS sozlamalarini tekshiring
- Portlar ochiqligini tekshiring: `sudo netstat -tulpn`

---

**Muvaffaqiyatli deploy! 🚀**
