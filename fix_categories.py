#!/usr/bin/env python
"""Fix car categories - ensure all cars have valid categories"""

from app import app, db
from models import Car

def fix_categories():
    """Fix all car categories to be one of: byudjetillar, komfortli, premiumlar, krossoverlar"""
    valid_categories = ['byudjetillar', 'komfortli', 'premiumlar', 'krossoverlar']
    
    with app.app_context():
        cars = Car.query.all()
        print(f"Jami mashinalar: {len(cars)}")
        
        # Kategoriyalarni ko'rish
        print("\nMashinalarning kategoriyalari:")
        category_counts = {}
        for car in cars:
            cat = car.category
            if cat not in category_counts:
                category_counts[cat] = 0
            category_counts[cat] += 1
            print(f"  - {car.id}: {car.name} -> {car.category}")
        
        print("\nKategoriya statistikasi:")
        for cat, count in category_counts.items():
            print(f"  {cat}: {count} ta")
        
        # Noto'g'ri kategoriyalarni to'g'rilash
        fixed_count = 0
        for car in cars:
            if car.category not in valid_categories:
                print(f"\n⚠️  Noto'g'ri kategoriya: {car.name} ({car.category})")
                # Default: byudjetillar ga o'tkazish
                car.category = 'byudjetillar'
                fixed_count += 1
                print(f"   ✓ Tuzatildi: byudjetillar")
        
        if fixed_count > 0:
            db.session.commit()
            print(f"\n✅ {fixed_count} ta mashina tuzatildi!")
        else:
            print("\n✅ Barcha mashinalar to'g'ri kategoriyada!")

if __name__ == '__main__':
    fix_categories()
