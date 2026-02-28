#!/usr/bin/env python3
"""Test adding car via API"""

from app import app, db
from models import Car, AdminUser
from flask_jwt_extended import create_access_token
import json

with app.app_context():
    # Get admin user
    admin = AdminUser.query.first()
    if not admin:
        print("Admin user not found!")
        exit(1)
    
    # Create token
    token = create_access_token(identity=str(admin.id))
    
    # Test data
    car_data = {
        'name': 'BMW',
        'category': 'byudjetillar',
        'price': 564544,
        'year': 2028,
        'fuel': 'Benzin',
        'transmission': 'Avtomatik',
        'has_ac': False,
        'seats': 5,
        'fuel_consumption': 0,
        'quantity': 10,
        'image': 'http://example.com/image.jpg',
        'available': True
    }
    
    print(f"\n=== TEST: Adding car with quantity=10 ===\n")
    print(f"Car data: {json.dumps(car_data, indent=2)}\n")
    
    # Simulate the request
    with app.test_client() as client:
        response = client.post(
            '/api/admin/cars',
            json=car_data,
            headers={'Authorization': f'Bearer {token}'}
        )
        
        print(f"Response status: {response.status_code}")
        print(f"Response data: {json.dumps(response.get_json(), indent=2)}\n")
    
    # Check database
    cars = Car.query.all()
    print(f"=== DATABASE'DA {len(cars)} TA MASHINA ===\n")
    for car in cars:
        print(f"ID: {car.id}, Name: {car.name}, Quantity: {car.quantity}")
