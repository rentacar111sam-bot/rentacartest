#!/usr/bin/env python3
"""Script to clean test cars from database"""

from app import app, db
from models import Car, Booking

def clean_database():
    """Remove all test cars from database"""
    with app.app_context():
        try:
            # First delete all bookings
            all_bookings = Booking.query.all()
            print(f"\n📊 Database'da {len(all_bookings)} ta bron bor")
            
            Booking.query.delete()
            db.session.commit()
            print(f"✅ Barcha bronlar o'chirildi!")
            
            # Get all cars
            all_cars = Car.query.all()
            print(f"📊 Database'da {len(all_cars)} ta mashina bor")
            
            # Delete all cars
            Car.query.delete()
            db.session.commit()
            
            print(f"✅ Barcha test mashinalar o'chirildi!")
            print(f"✅ Database tozalandi\n")
        
        except Exception as e:
            db.session.rollback()
            print(f"❌ Xatolik: {e}")

if __name__ == '__main__':
    clean_database()
