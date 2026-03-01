#!/bin/bash

# RentCar PM2 Deploy Script
# Bu skript loyihani PM2 bilan VPS serverga deploy qiladi

set -e

echo "=============================================="
echo "🚗 RentCar PM2 Deploy Script"
echo "=============================================="

# Ranglar
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# 1. Sistema yangilanishlar
print_info "Sistema paketlarini yangilash..."
sudo apt update && sudo apt upgrade -y
print_success "Sistema yangilandi"

# 2. Kerakli paketlarni o'rnatish
print_info "Kerakli paketlarni o'rnatish..."
sudo apt install -y python3 python3-pip python3-venv nginx git curl ufw
print_success "Paketlar o'rnatildi"

# 3. Node.js o'rnatish
print_info "Node.js o'rnatish..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    print_success "Node.js o'rnatildi"
else
    print_success "Node.js allaqachon o'rnatilgan"
fi

# 4. PM2 o'rnatish
print_info "PM2 o'rnatish..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    print_success "PM2 o'rnatildi"
else
    print_success "PM2 allaqachon o'rnatilgan"
fi

# 5. Loyiha papkasini yaratish
print_info "Loyiha papkasini yaratish..."
sudo mkdir -p /var/www/rentcar
sudo mkdir -p /var/www/rentcar/logs
print_success "Papkalar yaratildi"

# 6. Fayllarni ko'chirish
print_info "Fayllarni ko'chirish..."
print_info "Iltimos, fayllarni qo'lda ko'chiring:"
echo "  scp -r ./* root@server_ip:/var/www/rentcar/"
read -p "Fayllar ko'chirilganidan keyin Enter bosing..."

# 7. Virtual environment yaratish
print_info "Python virtual environment yaratish..."
cd /var/www/rentcar
python3 -m venv venv
source venv/bin/activate
print_success "Virtual environment yaratildi"

# 8. Python kutubxonalarini o'rnatish
print_info "Python kutubxonalarini o'rnatish..."
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn
print_success "Python kutubxonalari o'rnatildi"

# 9. Ma'lumotlar bazasini yaratish
print_info "Ma'lumotlar bazasini yaratish..."
python init_project.py
print_success "Ma'lumotlar bazasi yaratildi"

# 10. Frontend build
print_info "Frontend build qilish..."
cd /var/www/rentcar/frontend
npm install
npm run build
print_success "Frontend build qilindi"

# 11. PM2 bilan ishga tushirish
print_info "PM2 bilan ishga tushirish..."
cd /var/www/rentcar

# Eski processlarni to'xtatish (agar mavjud bo'lsa)
pm2 delete all 2>/dev/null || true

# Ecosystem file bilan ishga tushirish
pm2 start ecosystem.config.js

# PM2 statusini ko'rsatish
pm2 list

print_success "PM2 processlar ishga tushirildi"

# 12. PM2 startup
print_info "PM2 startup sozlash..."
pm2 startup
print_info "Yuqoridagi buyruqni ko'chirib ishga tushiring, keyin Enter bosing..."
read -p "Startup buyrug'i bajarilganidan keyin Enter bosing..."
pm2 save
print_success "PM2 startup sozlandi"

# 13. Nginx konfiguratsiyasi
print_info "Nginx konfiguratsiyasini yaratish..."
read -p "Domeningizni kiriting (masalan: rentcar.uz): " DOMAIN

sudo tee /etc/nginx/sites-available/rentcar > /dev/null <<EOF
# Backend API
server {
    listen 80;
    server_name api.$DOMAIN;
    
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
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
    server_name $DOMAIN www.$DOMAIN;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/rentcar /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
print_success "Nginx konfiguratsiyasi yaratildi"

# 14. Firewall sozlash
print_info "Firewall sozlash..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
echo "y" | sudo ufw enable
print_success "Firewall sozlandi"

# 15. Fayllar huquqlarini sozlash
print_info "Fayllar huquqlarini sozlash..."
sudo chown -R $USER:$USER /var/www/rentcar
sudo chmod -R 755 /var/www/rentcar
sudo chmod -R 775 /var/www/rentcar/uploads
print_success "Huquqlar sozlandi"

# 16. SSL sertifikat (ixtiyoriy)
print_info "SSL sertifikat o'rnatish..."
read -p "SSL sertifikat o'rnatmoqchimisiz? (y/n): " INSTALL_SSL

if [ "$INSTALL_SSL" = "y" ]; then
    sudo apt install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN -d api.$DOMAIN
    print_success "SSL sertifikat o'rnatildi"
else
    print_info "SSL sertifikat o'rnatilmadi"
fi

# 17. PM2 log rotation
print_info "PM2 log rotation sozlash..."
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
print_success "Log rotation sozlandi"

echo ""
echo "=============================================="
print_success "Deploy muvaffaqiyatli yakunlandi!"
echo "=============================================="
echo ""
echo "📍 Kirish manzillari:"
echo "   Frontend: http://$DOMAIN"
echo "   Backend API: http://api.$DOMAIN/api/health"
echo "   Admin Panel: http://$DOMAIN/admin"
echo ""
echo "🔐 Admin ma'lumotlari:"
echo "   Username: admin"
echo "   Password: 101110"
echo ""
echo "📊 PM2 buyruqlari:"
echo "   Status: pm2 list"
echo "   Logs: pm2 logs"
echo "   Restart: pm2 restart all"
echo "   Stop: pm2 stop all"
echo ""
echo "📊 Monitoring:"
echo "   pm2 monit"
echo "   pm2 logs --lines 100"
echo ""
print_info "MUHIM: .env faylidagi parollarni o'zgartiring!"
echo "=============================================="
