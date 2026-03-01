#!/usr/bin/env python3
"""
RentCar Production Server Runner
Windows uchun Waitress, Linux uchun Gunicorn
"""

import os
import sys
import platform
from app import app, init_db

def main():
    """Run the application in production mode"""
    
    # Initialize database
    print("Initializing database...")
    try:
        init_db()
        print("✅ Database initialized successfully!")
    except Exception as e:
        print(f"⚠️  Database initialization warning: {e}")
        print("Continuing with server startup...")
    
    # Get configuration
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5000))
    workers = int(os.getenv('WORKERS', 4))
    
    print("\n" + "="*60)
    print("🚀 RentCar Production Server")
    print("="*60)
    print(f"Environment: {os.getenv('FLASK_ENV', 'production')}")
    print(f"Host: {host}")
    print(f"Port: {port}")
    print(f"Workers: {workers}")
    print(f"Platform: {platform.system()}")
    print("="*60 + "\n")
    
    # Check platform and use appropriate server
    if platform.system() == 'Windows':
        print("🪟 Using Waitress (Windows Production Server)")
        try:
            from waitress import serve
            print(f"✅ Server running at http://{host}:{port}")
            print("Press Ctrl+C to stop\n")
            serve(app, host=host, port=port, threads=workers)
        except ImportError:
            print("❌ Waitress not installed!")
            print("Install it with: pip install waitress")
            sys.exit(1)
    else:
        print("🐧 Using Gunicorn (Linux Production Server)")
        try:
            # Use gunicorn for Linux
            os.system(f'gunicorn --workers {workers} --bind {host}:{port} --timeout 120 app:app')
        except Exception as e:
            print(f"❌ Error starting Gunicorn: {e}")
            print("Install it with: pip install gunicorn")
            sys.exit(1)

if __name__ == '__main__':
    main()
