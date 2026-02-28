#!/usr/bin/env python3
"""Clear all cars from database"""

from app import app, db
from models import Car

with app.app_context():
    # Delete all cars
    Car.query.delete()
    db.session.commit()
    print("✓ Barcha mashinalar o'chirildi")
