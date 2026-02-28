#!/usr/bin/env python3
"""
Initialize RentCar project
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

def init_database():
    """Initialize database with tables and sample data"""
    print("🗄️  Initializing database...")
    
    try:
        from app import app, db
        from models import Car, Booking, ContactMessage, AdminUser
        
        with app.app_context():
            # Create all tables
            print("  Creating tables...")
            db.create_all()
            
            # Check if admin user exists
            admin = AdminUser.query.filter_by(username='admin').first()
            if not admin:
                print("  Creating admin user...")
                admin = AdminUser(
                    username='admin',
                    email='admin@rentcar.uz',
                    role='admin'
                )
                admin.set_password(os.getenv('ADMIN_PASSWORD', '101110'))
                db.session.add(admin)
            
            # Check if sample cars exist
            if Car.query.count() == 0:
                print("  Adding sample cars...")
                sample_cars = [
                    {
                        'name': 'Toyota Camry',
                        'category': 'komfortli',
                        'price': 150000,
                        'image': 'https://via.placeholder.com/300x200?text=Toyota+Camry',
                        'features': ['Avtomatik', 'Konditsioner', 'GPS', '5 o\'rin'],
                        'year': 2022,
                        'fuel': 'Benzin',
                        'transmission': 'Avtomatik',
                        'available': True
                    },
                    {
                        'name': 'Chevrolet Lacetti',
                        'category': 'byudjetillar',
                        'price': 100000,
                        'image': 'https://via.placeholder.com/300x200?text=Chevrolet+Lacetti',
                        'features': ['Mexanik', 'Konditsioner', '5 o\'rin'],
                        'year': 2021,
                        'fuel': 'Benzin',
                        'transmission': 'Mexanik',
                        'available': True
                    },
                    {
                        'name': 'BMW X5',
                        'category': 'premiumlar',
                        'price': 300000,
                        'image': 'https://via.placeholder.com/300x200?text=BMW+X5',
                        'features': ['Avtomatik', 'Konditsioner', 'GPS', 'Teri salon', '7 o\'rin'],
                        'year': 2023,
                        'fuel': 'Benzin',
                        'transmission': 'Avtomatik',
                        'available': True
                    },
                    {
                        'name': 'Hyundai Tucson',
                        'category': 'krossoverlar',
                        'price': 200000,
                        'image': 'https://via.placeholder.com/300x200?text=Hyundai+Tucson',
                        'features': ['Avtomatik', 'Konditsioner', 'GPS', '5 o\'rin', '4WD'],
                        'year': 2022,
                        'fuel': 'Benzin',
                        'transmission': 'Avtomatik',
                        'available': True
                    }
                ]
                
                for car_data in sample_cars:
                    car = Car(**car_data)
                    db.session.add(car)
            
            db.session.commit()
            print("✅ Database initialized successfully!")
            print(f"   Admin username: admin")
            print(f"   Admin password: 101110")
            return True
            
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        import traceback
        traceback.print_exc()
        return False

def create_uploads_dir():
    """Create uploads directory"""
    print("📁 Creating uploads directory...")
    os.makedirs('uploads', exist_ok=True)
    print("✅ Uploads directory ready!")

def main():
    """Main initialization function"""
    print("=" * 60)
    print("🚗 RentCar Project Initialization")
    print("=" * 60)
    
    # Create uploads directory
    create_uploads_dir()
    
    # Initialize database
    if not init_database():
        print("\n❌ Initialization failed!")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✅ Project initialization completed!")
    print("=" * 60)
    print("\n📝 Next steps:")
    print("   1. Start backend: python run.py")
    print("   2. In another terminal, start frontend:")
    print("      cd frontend && npm run dev")
    print("\n📍 Access points:")
    print("   - Frontend: http://localhost:3000")
    print("   - Backend API: http://localhost:5000/api")
    print("   - Admin Panel: http://localhost:3000/admin")
    print("=" * 60)

if __name__ == '__main__':
    main()
