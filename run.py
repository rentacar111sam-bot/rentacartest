#!/usr/bin/env python3
"""
RentCar Application Runner
"""

import os
import sys
from app import app, init_db

def main():
    """Main function to run the application"""
    
    # Check if we need to initialize the database
    if len(sys.argv) > 1 and sys.argv[1] == 'init-db':
        print("Initializing database...")
        init_db()
        print("Database initialization completed!")
        return
    
    # Check if we need to create admin user
    if len(sys.argv) > 1 and sys.argv[1] == 'create-admin':
        from models import AdminUser, db
        
        username = input("Enter admin username: ")
        password = input("Enter admin password: ")
        email = input("Enter admin email (optional): ")
        
        with app.app_context():
            # Check if admin already exists
            existing_admin = AdminUser.query.filter_by(username=username).first()
            if existing_admin:
                print(f"Admin user '{username}' already exists!")
                return
            
            # Create new admin
            admin = AdminUser(
                username=username,
                email=email if email else f"{username}@rentcar.uz",
                role='admin'
            )
            admin.set_password(password)
            
            db.session.add(admin)
            db.session.commit()
            
            print(f"Admin user '{username}' created successfully!")
        return
    
    # Run the Flask application
    print("Starting RentCar application...")
    print(f"Environment: {os.getenv('FLASK_ENV', 'production')}")
    print(f"Database: {os.getenv('DATABASE_URL', 'sqlite:///rentcar.db')}")
    print("Access the application at: http://localhost:5000")
    print("Access admin panel at: http://localhost:5000/admin")
    print("\nPress Ctrl+C to stop the server")
    
    # Run the app
    app.run(
        debug=os.getenv('FLASK_ENV') == 'development',
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000))
    )

if __name__ == '__main__':
    main()