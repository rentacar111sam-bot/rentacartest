#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Databsedagi ma'lumotlarni tekshirish
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.pool import NullPool

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
engine = create_engine(DATABASE_URL, poolclass=NullPool, echo=False)

print("\n" + "=" * 70)
print("📊 DATABSEDAGI MA'LUMOTLAR")
print("=" * 70)

try:
    with engine.connect() as conn:
        # Categories
        print("\n🏷️  KATEGORIYALAR:")
        result = conn.execute(text("SELECT id, name, slug FROM categories LIMIT 10"))
        rows = result.fetchall()
        if rows:
            for row in rows:
                print(f"   • ID: {row[0]}, Nomi: {row[1]}, Slug: {row[2]}")
        else:
            print("   ⚠️  Kategoriya yo'q")
        
        # Cars
        print("\n🚗 AVTOMOBILLAR:")
        result = conn.execute(text("SELECT id, name, category, price FROM cars LIMIT 10"))
        rows = result.fetchall()
        if rows:
            for row in rows:
                print(f"   • ID: {row[0]}, Nomi: {row[1]}, Kategoriya: {row[2]}, Narx: {row[3]}")
        else:
            print("   ⚠️  Avtomobil yo'q")
        
        # Bookings
        print("\n📅 BRONLAR:")
        result = conn.execute(text("SELECT id, booking_id, car_id, first_name, status FROM bookings LIMIT 10"))
        rows = result.fetchall()
        if rows:
            for row in rows:
                print(f"   • ID: {row[0]}, Bron ID: {row[1]}, Avtomobil ID: {row[2]}, Ism: {row[3]}, Status: {row[4]}")
        else:
            print("   ⚠️  Bron yo'q")
        
        # Users
        print("\n👥 FOYDALANUVCHILAR:")
        result = conn.execute(text("SELECT id, email, first_name, phone FROM users LIMIT 10"))
        rows = result.fetchall()
        if rows:
            for row in rows:
                print(f"   • ID: {row[0]}, Email: {row[1]}, Ism: {row[2]}, Telefon: {row[3]}")
        else:
            print("   ⚠️  Foydalanuvchi yo'q")
        
        # Admin Users
        print("\n🔐 ADMIN FOYDALANUVCHILAR:")
        result = conn.execute(text("SELECT id, username, email, role FROM admin_users LIMIT 10"))
        rows = result.fetchall()
        if rows:
            for row in rows:
                print(f"   • ID: {row[0]}, Username: {row[1]}, Email: {row[2]}, Rol: {row[3]}")
        else:
            print("   ⚠️  Admin yo'q")
        
        # Contact Messages
        print("\n📨 ALOQA XABARLARI:")
        result = conn.execute(text("SELECT id, name, phone, subject FROM contact_messages LIMIT 10"))
        rows = result.fetchall()
        if rows:
            for row in rows:
                print(f"   • ID: {row[0]}, Ism: {row[1]}, Telefon: {row[2]}, Mavzu: {row[3]}")
        else:
            print("   ⚠️  Xabar yo'q")

except Exception as e:
    print(f"\n❌ XATOLIK: {str(e)}")

print("\n" + "=" * 70)
