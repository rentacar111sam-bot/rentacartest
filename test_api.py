#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
API ni test qilish
"""
import requests
import json

BASE_URL = "http://localhost:5000/api"

print("\n" + "=" * 70)
print("🧪 API TEST")
print("=" * 70)

# Test 1: Get cars
print("\n1️⃣  AVTOMOBILLARNI OLISH:")
try:
    response = requests.get(f"{BASE_URL}/cars", timeout=5)
    if response.status_code == 200:
        cars = response.json()
        print(f"   ✅ {len(cars)} ta avtomobil olindi")
        for car in cars[:3]:
            print(f"      • {car['name']} - {car['price']:,} so'm")
    else:
        print(f"   ❌ Xatolik: {response.status_code}")
except Exception as e:
    print(f"   ❌ Xatolik: {str(e)}")

# Test 2: Get categories
print("\n2️⃣  KATEGORIYALARNI OLISH:")
try:
    response = requests.get(f"{BASE_URL}/categories", timeout=5)
    if response.status_code == 200:
        categories = response.json()
        print(f"   ✅ {len(categories)} ta kategoriya olindi")
        for cat in categories[:3]:
            print(f"      • {cat['name']} ({cat['slug']})")
    else:
        print(f"   ❌ Xatolik: {response.status_code}")
except Exception as e:
    print(f"   ❌ Xatolik: {str(e)}")

# Test 3: Get admin stats
print("\n3️⃣  ADMIN STATISTIKASINI OLISH:")
try:
    response = requests.get(f"{BASE_URL}/admin/stats", timeout=5)
    if response.status_code == 200:
        stats = response.json()
        print(f"   ✅ Statistika olindi:")
        print(f"      • Avtomobillar: {stats.get('total_cars', 0)}")
        print(f"      • Bronlar: {stats.get('total_bookings', 0)}")
        print(f"      • Foydalanuvchilar: {stats.get('total_users', 0)}")
        print(f"      • Kutilayotgan bronlar: {stats.get('pending_bookings', 0)}")
    else:
        print(f"   ❌ Xatolik: {response.status_code}")
except Exception as e:
    print(f"   ❌ Xatolik: {str(e)}")

# Test 4: Get bookings
print("\n4️⃣  BRONLARNI OLISH:")
try:
    response = requests.get(f"{BASE_URL}/bookings", timeout=5)
    if response.status_code == 200:
        data = response.json()
        bookings = data.get('bookings', [])
        print(f"   ✅ {len(bookings)} ta bron olindi")
        if bookings:
            for booking in bookings[:2]:
                print(f"      • {booking['user_name']} - {booking['status']}")
        else:
            print(f"      ⚠️  Hech qanday bron yo'q")
    else:
        print(f"   ❌ Xatolik: {response.status_code}")
except Exception as e:
    print(f"   ❌ Xatolik: {str(e)}")

# Test 5: Get admin users
print("\n5️⃣  ADMIN FOYDALANUVCHILARNI OLISH:")
try:
    response = requests.get(f"{BASE_URL}/admin/users", timeout=5)
    if response.status_code == 200:
        data = response.json()
        users = data.get('users', [])
        print(f"   ✅ {len(users)} ta foydalanuvchi olindi")
        for user in users[:3]:
            print(f"      • {user['first_name']} {user['last_name']} ({user['email']})")
    else:
        print(f"   ❌ Xatolik: {response.status_code}")
except Exception as e:
    print(f"   ❌ Xatolik: {str(e)}")

print("\n" + "=" * 70)
print("✅ API TEST YAKUNLANDI")
print("=" * 70 + "\n")
