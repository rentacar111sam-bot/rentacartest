#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Databseni tekshirish skripti
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.pool import NullPool

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("❌ DATABASE_URL .env faylida topilmadi!")
    exit(1)

print("=" * 70)
print("🔍 DATABSE TEKSHIRUVI")
print("=" * 70)
print(f"\n📍 Databse URL: {DATABASE_URL[:50]}...")

try:
    # Create engine
    engine = create_engine(DATABASE_URL, poolclass=NullPool, echo=False)
    
    # Test connection
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("✅ Databsega ulanish muvaffaqiyatli!")
    
    # Get inspector
    inspector = inspect(engine)
    
    # Get all tables
    tables = inspector.get_table_names()
    print(f"\n📊 Jami jadvallar: {len(tables)}")
    print("-" * 70)
    
    if not tables:
        print("⚠️  Databseda hech qanday jadval yo'q!")
    else:
        for table_name in sorted(tables):
            print(f"\n📋 Jadval: {table_name}")
            
            # Get columns
            columns = inspector.get_columns(table_name)
            print(f"   Ustunlar: {len(columns)}")
            for col in columns:
                col_type = str(col['type'])
                nullable = "✓ NULL" if col['nullable'] else "✗ NOT NULL"
                print(f"   • {col['name']}: {col_type} ({nullable})")
            
            # Get row count
            with engine.connect() as connection:
                result = connection.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
                count = result.scalar()
                print(f"   📈 Qatorlar: {count}")
    
    print("\n" + "=" * 70)
    print("✅ DATABSE TEKSHIRUVI YAKUNLANDI")
    print("=" * 70)
    
except Exception as e:
    print(f"\n❌ XATOLIK: {str(e)}")
    print("\n🔧 MUAMMONI YECHISH:")
    
    if "could not translate host name" in str(e):
        print("   • Internet ulanishini tekshiring")
        print("   • Firewall sozlamalarini tekshiring")
        print("   • VPN yoqib ko'ring")
    elif "Connection refused" in str(e):
        print("   • Supabase server javob bermayapti")
        print("   • Supabase status sahifasini tekshiring")
    elif "timeout" in str(e).lower():
        print("   • Internet tezligini tekshiring")
        print("   • Supabase ulanish sozlamalarini tekshiring")
    else:
        print(f"   • Xatolik: {str(e)}")
    
    exit(1)
