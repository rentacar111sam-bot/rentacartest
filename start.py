#!/usr/bin/env python3
"""
RentCar Application Starter
Bu fayl loyihani ishga tushirish uchun
"""

import os
import sys
import subprocess
import time

def install_requirements():
    """Python kutubxonalarini o'rnatish"""
    print("📦 Python kutubxonalarini o'rnatish...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Python kutubxonalari muvaffaqiyatli o'rnatildi!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Kutubxonalarni o'rnatishda xatolik: {e}")
        return False

def setup_database():
    """Ma'lumotlar bazasini sozlash"""
    print("🗄️  Ma'lumotlar bazasini sozlash...")
    try:
        from app import app, db
        from models import Car, Booking, ContactMessage, AdminUser
        
        with app.app_context():
            # Create all tables
            db.create_all()
            
            # Check if admin user exists
            admin = AdminUser.query.filter_by(username='admin').first()
            if not admin:
                admin = AdminUser(
                    username='admin',
                    email='admin@rentcar.uz',
                    role='admin'
                )
                admin.set_password('admin123')
                db.session.add(admin)
            
            # Check if sample cars exist
            if Car.query.count() == 0:
                sample_cars = [
                    {
                        'name': 'Toyota Camry',
                        'category': 'komfortli',
                        'price': 150000,
                        'image': 'https://via.placeholder.com/300x200?text=Toyota+Camry',
                        'features': ['Avtomatik', 'Konditsioner', 'GPS', '5 o\'rin'],
                        'year': 2022,
                        'fuel': 'Benzin',
                        'transmission': 'Avtomatik'
                    },
                    {
                        'name': 'Chevrolet Lacetti',
                        'category': 'byudjetillar',
                        'price': 100000,
                        'image': 'https://via.placeholder.com/300x200?text=Chevrolet+Lacetti',
                        'features': ['Mexanik', 'Konditsioner', '5 o\'rin'],
                        'year': 2021,
                        'fuel': 'Benzin',
                        'transmission': 'Mexanik'
                    },
                    {
                        'name': 'BMW X5',
                        'category': 'premiumlar',
                        'price': 300000,
                        'image': 'https://via.placeholder.com/300x200?text=BMW+X5',
                        'features': ['Avtomatik', 'Konditsioner', 'GPS', 'Teri salon', '7 o\'rin'],
                        'year': 2023,
                        'fuel': 'Benzin',
                        'transmission': 'Avtomatik'
                    }
                ]
                
                for car_data in sample_cars:
                    car = Car(**car_data)
                    db.session.add(car)
            
            db.session.commit()
            print("✅ Ma'lumotlar bazasi muvaffaqiyatli sozlandi!")
            print("👤 Admin login: admin")
            print("🔑 Admin parol: admin123")
            return True
            
    except Exception as e:
        print(f"❌ Ma'lumotlar bazasini sozlashda xatolik: {e}")
        return False

def start_backend():
    """Backend serverni ishga tushirish"""
    print("🚀 Backend serverni ishga tushirish...")
    print("📍 Backend: http://localhost:5000")
    
    try:
        from app import app
        app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=False)
    except Exception as e:
        print(f"❌ Backend serverini ishga tushirishda xatolik: {e}")

def start_frontend():
    """Frontend serverni ishga tushirish"""
    print("🎨 Frontend serverni ishga tushirish...")
    print("📍 Frontend: http://localhost:3000")
    
    frontend_dir = "frontend"
    if not os.path.exists(frontend_dir):
        print("❌ Frontend papkasi topilmadi!")
        return False
    
    try:
        # Change to frontend directory
        os.chdir(frontend_dir)
        
        # Install dependencies if node_modules doesn't exist
        if not os.path.exists("node_modules"):
            print("📦 Frontend kutubxonalarini o'rnatish...")
            subprocess.check_call(["npm", "install"])
        
        # Start development server
        subprocess.check_call(["npm", "run", "dev"])
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Frontend serverini ishga tushirishda xatolik: {e}")
        return False
    except FileNotFoundError:
        print("❌ Node.js yoki npm topilmadi! Iltimos Node.js ni o'rnating.")
        return False

def main():
    """Asosiy funksiya"""
    print("🚗 RentCar loyihasini ishga tushirish")
    print("=" * 50)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 yoki undan yuqori versiya kerak!")
        return
    
    # Install requirements
    if not install_requirements():
        return
    
    # Setup database
    if not setup_database():
        return
    
    # Create uploads directory
    os.makedirs("uploads", exist_ok=True)
    
    print("\n" + "=" * 50)
    print("✅ Loyiha muvaffaqiyatli ishga tushirildi!")
    print("📍 Backend: http://localhost:5000")
    print("📍 API: http://localhost:5000/api")
    print("📍 Admin panel: http://localhost:5000/admin (keyingi versiyada)")
    print("\n🔧 Frontend uchun alohida terminal ochib quyidagi buyruqlarni bajaring:")
    print("   cd frontend")
    print("   npm install")
    print("   npm run dev")
    print("\n📍 Frontend: http://localhost:3000")
    print("\n⚠️  Serverni to'xtatish uchun Ctrl+C bosing")
    print("=" * 50)
    
    # Start backend server
    start_backend()

if __name__ == '__main__':
    main()