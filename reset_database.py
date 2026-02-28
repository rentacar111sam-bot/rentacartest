from app import app, db
from sqlalchemy import text

with app.app_context():
    try:
        # First, drop all tables that use the enum
        print('Dropping tables...')
        db.session.execute(text('DROP TABLE IF EXISTS cars CASCADE'))
        db.session.execute(text('DROP TABLE IF EXISTS bookings CASCADE'))
        db.session.commit()
        
        # Now drop the enum type
        print('Dropping enum type...')
        db.session.execute(text('DROP TYPE IF EXISTS car_category CASCADE'))
        db.session.commit()
        
        # Create new enum type with new values
        print('Creating new enum type...')
        db.session.execute(text("""
            CREATE TYPE car_category AS ENUM ('byudjetillar', 'komfortli', 'premiumlar', 'krossoverlar')
        """))
        db.session.commit()
        
        # Now recreate all tables
        print('Creating tables...')
        db.create_all()
        
        # Create admin user if not exists
        print('Creating admin user...')
        from models import AdminUser
        admin = AdminUser.query.filter_by(username='admin').first()
        if not admin:
            admin = AdminUser(
                username='admin',
                email='admin@rentcar.uz',
                role='admin'
            )
            admin.set_password('101110')
            db.session.add(admin)
            db.session.commit()
        else:
            print('Admin user already exists')
        
        print('✅ Database muvaffaqiyatli qayta yaratildi!')
        print('Admin: admin / 101110')
        
    except Exception as e:
        print(f'❌ Xatolik: {e}')
        db.session.rollback()
