#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Databseni to'g'ri qilish va avtomobillar qo'shish
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.pool import NullPool

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
engine = create_engine(DATABASE_URL, poolclass=NullPool, echo=False)

print("\n" + "=" * 70)
print("🔧 DATABSENI TO'G'RI QILISH")
print("=" * 70)

try:
    with engine.connect() as conn:
        # Noto'g'ri avtomobillarni o'chirish
        print("\n🗑️  Noto'g'ri avtomobillarni o'chirish...")
        conn.execute(text("DELETE FROM cars WHERE name = 'gfgfg'"))
        conn.commit()
        print("   ✅ O'chirildi")
        
        # Yangi avtomobillar qo'shish
        print("\n➕ Yangi avtomobillar qo'shish...")
        
        cars_data = [
            ("Toyota Camry", "komfortli", 150000, 2023, "Benzin", "Avtomatik", True, 5, 8.5),
            ("Hyundai Elantra", "byudjetillar", 100000, 2023, "Benzin", "Avtomatik", True, 5, 7.2),
            ("BMW X5", "premiumlar", 350000, 2023, "Benzin", "Avtomatik", True, 7, 12.0),
            ("Mercedes-Benz E-Class", "premiumlar", 400000, 2023, "Benzin", "Avtomatik", True, 5, 11.5),
            ("Chevrolet Captiva", "krossoverlar", 200000, 2023, "Benzin", "Avtomatik", True, 7, 10.0),
            ("Kia Sportage", "krossoverlar", 180000, 2023, "Benzin", "Avtomatik", True, 5, 9.5),
            ("Daewoo Matiz", "byudjetillar", 80000, 2022, "Benzin", "Mexanik", False, 5, 6.0),
            ("Chevrolet Spark", "byudjetillar", 90000, 2023, "Benzin", "Avtomatik", True, 5, 6.5),
            ("Honda Accord", "komfortli", 160000, 2023, "Benzin", "Avtomatik", True, 5, 8.8),
            ("Nissan Qashqai", "krossoverlar", 190000, 2023, "Benzin", "Avtomatik", True, 5, 9.8),
        ]
        
        for name, category, price, year, fuel, transmission, has_ac, seats, fuel_consumption in cars_data:
            conn.execute(text("""
                INSERT INTO cars (name, category, price, year, fuel, transmission, has_ac, seats, fuel_consumption, quantity, available, created_at, updated_at)
                VALUES (:name, :category, :price, :year, :fuel, :transmission, :has_ac, :seats, :fuel_consumption, 1, true, NOW(), NOW())
            """), {
                "name": name,
                "category": category,
                "price": price,
                "year": year,
                "fuel": fuel,
                "transmission": transmission,
                "has_ac": has_ac,
                "seats": seats,
                "fuel_consumption": fuel_consumption
            })
            print(f"   ✅ {name} qo'shildi")
        
        conn.commit()
        
        # Yangi ma'lumotlarni ko'rsatish
        print("\n📊 YANGI AVTOMOBILLAR:")
        result = conn.execute(text("SELECT id, name, category, price FROM cars ORDER BY id"))
        rows = result.fetchall()
        for row in rows:
            print(f"   • ID: {row[0]}, Nomi: {row[1]}, Kategoriya: {row[2]}, Narx: {row[3]:,}")
        
        print(f"\n   Jami avtomobillar: {len(rows)}")

except Exception as e:
    print(f"\n❌ XATOLIK: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 70)
print("✅ DATABSE TO'G'RI QILINDI")
print("=" * 70 + "\n")
