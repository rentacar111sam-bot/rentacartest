#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Databsega namuna avtomobillar qo'shish
"""
import os
from dotenv import load_dotenv
from models import db, Car
from app import app

load_dotenv()

print("\n" + "=" * 70)
print("➕ DATABSEGA AVTOMOBILLAR QO'SHISH")
print("=" * 70)

# Sample cars data
cars_data = [
    {
        "name": "Toyota Camry",
        "category": "komfortli",
        "price": 150000,
        "year": 2023,
        "fuel": "Benzin",
        "transmission": "Avtomatik",
        "has_ac": True,
        "seats": 5,
        "fuel_consumption": 8.5,
        "image": "/placeholder-car.svg"
    },
    {
        "name": "Hyundai Elantra",
        "category": "byudjetillar",
        "price": 100000,
        "year": 2023,
        "fuel": "Benzin",
        "transmission": "Avtomatik",
        "has_ac": True,
        "seats": 5,
        "fuel_consumption": 7.2,
        "image": "/placeholder-car.svg"
    },
    {
        "name": "BMW X5",
        "category": "premiumlar",
        "price": 350000,
        "year": 2023,
        "fuel": "Benzin",
        "transmission": "Avtomatik",
        "has_ac": True,
        "seats": 7,
        "fuel_consumption": 12.0,
        "image": "/placeholder-car.svg"
    },
    {
        "name": "Mercedes-Benz E-Class",
        "category": "premiumlar",
        "price": 400000,
        "year": 2023,
        "fuel": "Benzin",
        "transmission": "Avtomatik",
        "has_ac": True,
        "seats": 5,
        "fuel_consumption": 11.5,
        "image": "/placeholder-car.svg"
    },
    {
        "name": "Chevrolet Captiva",
        "category": "krossoverlar",
        "price": 200000,
        "year": 2023,
        "fuel": "Benzin",
        "transmission": "Avtomatik",
        "has_ac": True,
        "seats": 7,
        "fuel_consumption": 10.0,
        "image": "/placeholder-car.svg"
    },
    {
        "name": "Kia Sportage",
        "category": "krossoverlar",
        "price": 180000,
        "year": 2023,
        "fuel": "Benzin",
        "transmission": "Avtomatik",
        "has_ac": True,
        "seats": 5,
        "fuel_consumption": 9.5,
        "image": "/placeholder-car.svg"
    },
    {
        "name": "Daewoo Matiz",
        "category": "byudjetillar",
        "price": 80000,
        "year": 2022,
        "fuel": "Benzin",
        "transmission": "Mexanik",
        "has_ac": False,
        "seats": 5,
        "fuel_consumption": 6.0,
        "image": "/placeholder-car.svg"
    },
    {
        "name": "Chevrolet Spark",
        "category": "byudjetillar",
        "price": 90000,
        "year": 2023,
        "fuel": "Benzin",
        "transmission": "Avtomatik",
        "has_ac": True,
        "seats": 5,
        "fuel_consumption": 6.5,
        "image": "/placeholder-car.svg"
    },
    {
        "name": "Honda Accord",
        "category": "comfort",
        "price": 160000,
        "year": 2023,
        "fuel": "Benzin",
        "transmission": "Avtomatik",
        "has_ac": True,
        "seats": 5,
        "fuel_consumption": 8.8,
        "image": "/placeholder-car.svg"
    },
    {
        "name": "Nissan Qashqai",
        "category": "krossoverlar",
        "price": 190000,
        "year": 2023,
        "fuel": "Benzin",
        "transmission": "Avtomatik",
        "has_ac": True,
        "seats": 5,
        "fuel_consumption": 9.8,
        "image": "/placeholder-car.svg"
    },
]

try:
    with app.app_context():
        # Avval noto'g'ri avtomobillarni o'chirish
        print("\n🗑️  Noto'g'ri avtomobillarni o'chirish...")
        Car.query.filter(Car.name.in_(['gfgfg'])).delete()
        db.session.commit()
        print("   ✅ O'chirildi")
        
        # Yangi avtomobillar qo'shish
        print("\n➕ Yangi avtomobillar qo'shish...")
        for car_data in cars_data:
            # Tekshirish - bu avtomobil allaqachon bor mi?
            existing = Car.query.filter_by(name=car_data['name']).first()
            if not existing:
                car = Car(
                    name=car_data['name'],
                    category=car_data['category'],
                    price=car_data['price'],
                    year=car_data['year'],
                    fuel=car_data['fuel'],
                    transmission=car_data['transmission'],
                    has_ac=car_data['has_ac'],
                    seats=car_data['seats'],
                    fuel_consumption=car_data['fuel_consumption'],
                    image=car_data['image'],
                    quantity=1,
                    available=True
                )
                db.session.add(car)
                print(f"   ✅ {car_data['name']} qo'shildi")
            else:
                print(f"   ⏭️  {car_data['name']} allaqachon bor")
        
        db.session.commit()
        
        # Yangi ma'lumotlarni ko'rsatish
        print("\n📊 DATABSEDAGI AVTOMOBILLAR:")
        cars = Car.query.filter_by(available=True).order_by(Car.name).all()
        for car in cars:
            print(f"   • {car.name} ({car.category}) - {car.price:,} so'm")
        
        print(f"\n   ✅ Jami: {len(cars)} ta avtomobil")
        
        print("\n" + "=" * 70)
        print("✅ AVTOMOBILLAR QO'SHILDI")
        print("=" * 70 + "\n")

except Exception as e:
    print(f"\n❌ XATOLIK: {str(e)}")
    import traceback
    traceback.print_exc()
