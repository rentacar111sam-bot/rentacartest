from app import app, db
from sqlalchemy import text

with app.app_context():
    try:
        # Drop everything
        print('Dropping schema...')
        db.session.execute(text('DROP SCHEMA IF EXISTS public CASCADE'))
        db.session.execute(text('CREATE SCHEMA public'))
        db.session.commit()
        
        # Create new enum type with correct values
        print('Creating enum type with new values...')
        db.session.execute(text("""
            CREATE TYPE car_category AS ENUM ('byudjetillar', 'komfortli', 'premiumlar', 'krossoverlar')
        """))
        db.session.commit()
        
        # Create all tables
        print('Creating tables...')
        db.create_all()
        
        # Create admin user
        print('Creating admin user...')
        from models import AdminUser
        admin = AdminUser(
            username='admin',
            email='admin@rentcar.uz',
            role='admin'
        )
        admin.set_password('101110')
        db.session.add(admin)
        db.session.commit()
        
        print('✅ Database muvaffaqiyatli yaratildi!')
        print('Enum values: byudjetillar, komfortli, premiumlar, krossoverlar')
        
    except Exception as e:
        print(f'❌ Xatolik: {e}')
        db.session.rollback()
