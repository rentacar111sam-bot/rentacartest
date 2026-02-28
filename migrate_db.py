#!/usr/bin/env python3
"""
Database migration script to add missing columns to cars table
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("❌ DATABASE_URL not found in .env file")
    exit(1)

print("🔄 Starting database migration...")
print(f"📊 Database: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'Unknown'}")

try:
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as connection:
        # Check if columns exist and add them if they don't
        migrations = [
            {
                'name': 'has_ac',
                'sql': 'ALTER TABLE cars ADD COLUMN has_ac BOOLEAN DEFAULT FALSE;',
                'check': "SELECT column_name FROM information_schema.columns WHERE table_name='cars' AND column_name='has_ac'"
            },
            {
                'name': 'seats',
                'sql': 'ALTER TABLE cars ADD COLUMN seats INTEGER DEFAULT 5;',
                'check': "SELECT column_name FROM information_schema.columns WHERE table_name='cars' AND column_name='seats'"
            },
            {
                'name': 'fuel_consumption',
                'sql': 'ALTER TABLE cars ADD COLUMN fuel_consumption FLOAT DEFAULT 0.0;',
                'check': "SELECT column_name FROM information_schema.columns WHERE table_name='cars' AND column_name='fuel_consumption'"
            },
            {
                'name': 'quantity',
                'sql': 'ALTER TABLE cars ADD COLUMN quantity INTEGER DEFAULT 1;',
                'check': "SELECT column_name FROM information_schema.columns WHERE table_name='cars' AND column_name='quantity'"
            }
        ]
        
        for migration in migrations:
            try:
                # Check if column exists
                result = connection.execute(text(migration['check']))
                if result.fetchone():
                    print(f"✅ Column '{migration['name']}' already exists")
                else:
                    # Add column
                    connection.execute(text(migration['sql']))
                    connection.commit()
                    print(f"✅ Column '{migration['name']}' added successfully")
            except Exception as e:
                if 'already exists' in str(e):
                    print(f"✅ Column '{migration['name']}' already exists")
                else:
                    print(f"⚠️  Error with column '{migration['name']}': {e}")
        
        print("\n✅ Database migration completed successfully!")
        
except Exception as e:
    print(f"❌ Migration failed: {e}")
    exit(1)
