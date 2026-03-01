#!/bin/bash

# RentCar Update Script
# Bu skript loyihani VPS serverda yangilaydi

set -e

echo "=============================================="
echo "🔄 RentCar Update Script"
echo "=============================================="

# Ranglar
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
    sudo git pull origin main
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

# 5. Services ni qayta ishga tushirish
print_info "Services ni qayta ishga tushirish..."
sudo systemctl restart rentcar-backend
sudo systemctl restart rentcar-frontend
print_success "Services qayta ishga tushirildi"

# 6. Status tekshirish
print_info "Status tekshirish..."
sudo systemctl status rentcar-backend --no-pager
sudo systemctl status rentcar-frontend --no-pager

echo ""
echo "=============================================="
print_success "Yangilanish muvaffaqiyatli yakunlandi!"
echo "=============================================="
