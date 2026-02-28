#!/usr/bin/env python3
"""Check cars in database"""

from app import app, db
from models import Car

with app.app_context():
    cars = Car.query.all()
    print(f"\n=== DATABASE'DA {len(cars)} TA MASHINA BOR ===\n")
    
    for car in cars:
        print(f"ID: {car.id}")
        print(f"Nomi: {car.name}")
        print(f"Kategoriya: {car.category}")
        print(f"Narx: {car.price}")
        print(f"Quantity: {car.quantity}")
        print(f"Available: {car.available}")
        print("---")
    
    # Group by name
    print("\n=== GURUHLANGAN MASHINALAR ===\n")
    cars_dict = {}
    for car in cars:
        if car.name not in cars_dict:
            cars_dict[car.name] = 0
        cars_dict[car.name] += car.quantity
    
    for name, total_qty in cars_dict.items():
        print(f"{name}: {total_qty} ta")
