#!/bin/bash

# RentCar VPS Update Script
# Bu skript loyihani GitHub'dan yangilaydi va qayta ishga tushiradi

echo "🔄 RentCar loyihasini yangilash boshlandi..."
echo "================================================"

# 1. Loyiha papkasiga o'tish
cd /var/www/rentcar || exit 1
echo "✅ Loyiha papkasiga o'tildi"

# 2. Git'dan yangilanishlarni olish
echo ""
echo "📥 GitHub'dan yangilanishlarni yuklab olish..."
git fetch origin
git pull origin main
echo "✅ Yangilanishlar yuklandi"

# 3. Backend dependencies yangilash
echo ""
echo "📦 Backend dependencies yangilash..."
source venv/bin/activate
pip install -r requirements.txt --upgrade
echo "✅ Backend dependencies yangilandi"

# 4. Frontend dependencies va build
echo ""
echo "📦 Frontend dependencies va build..."
cd frontend
npm install
npm run build
cd ..
echo "✅ Frontend build tayyor"

# 5. Database migration (agar kerak bo'lsa)
echo ""
echo "🗄️  Database tekshirish..."
python check_database.py
echo "✅ Database tayyor"

# 6. PM2 bilan qayta ishga tushirish
echo ""
echo "🔄 Servislarni qayta ishga tushirish..."

# PM2 mavjudligini tekshirish
if command -v pm2 &> /dev/null; then
    echo "PM2 bilan qayta ishga tushirish..."
    pm2 restart all
    pm2 save
    echo "✅ PM2 servislari qayta ishga tushdi"
else
    # Systemd bilan qayta ishga tushirish
    echo "Systemd bilan qayta ishga tushirish..."
    sudo systemctl restart rentcar-backend
    sudo systemctl restart rentcar-frontend
    echo "✅ Systemd servislari qayta ishga tushdi"
fi

# 7. Status tekshirish
echo ""
echo "📊 Servislar holati:"
if command -v pm2 &> /dev/null; then
    pm2 list
else
    sudo systemctl status rentcar-backend --no-pager
    sudo systemctl status rentcar-frontend --no-pager
fi

echo ""
echo "================================================"
echo "✅ Yangilanish muvaffaqiyatli yakunlandi!"
echo "================================================"
echo ""
echo "🌐 Saytingizni tekshiring:"
echo "   Frontend: https://your-domain.com"
echo "   Backend: https://api.your-domain.com/api/health"
echo "   Admin: https://your-domain.com/admin"
echo ""
