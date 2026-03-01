#!/bin/bash

# RentCar PM2 Update Script
# Bu skript loyihani PM2 da yangilaydi

set -e

echo "=============================================="
echo "🔄 RentCar PM2 Update Script"
echo "=============================================="

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# 1. Loyiha papkasiga o'tish
cd /var/www/rentcar

# 2. Git yangilanishlarini olish (agar Git ishlatilsa)
if [ -d ".git" ]; then
    print_info "Git yangilanishlarini olish..."
    git pull origin main
    print_success "Git yangilandi"
fi

# 3. Backend yangilash
print_info "Backend yangilash..."
source venv/bin/activate
pip install -r requirements.txt
print_success "Backend yangilandi"

# 4. Frontend yangilash
print_info "Frontend yangilash..."
cd frontend
npm install
npm run build
print_success "Frontend yangilandi"

# 5. PM2 ni qayta ishga tushirish
print_info "PM2 ni qayta ishga tushirish..."
cd /var/www/rentcar
pm2 reload ecosystem.config.js
print_success "PM2 qayta ishga tushirildi"

# 6. Status tekshirish
print_info "Status tekshirish..."
pm2 list

echo ""
echo "=============================================="
print_success "Yangilanish muvaffaqiyatli yakunlandi!"
echo "=============================================="
echo ""
echo "📊 Foydali buyruqlar:"
echo "   pm2 list          - Status"
echo "   pm2 logs          - Loglar"
echo "   pm2 monit         - Monitoring"
echo "   pm2 restart all   - Restart"
echo ""
