from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from flask_caching import Cache
from flask_compress import Compress
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
import os
import json
from dotenv import load_dotenv
from security import rate_limit, sanitize_input, log_security_event

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Security Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-this')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///rentcar.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-this')
app.config['JWT_ALGORITHM'] = 'HS256'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)  # Reduced from 24 hours
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 5242880))
app.config['CACHE_TYPE'] = 'SimpleCache'
app.config['CACHE_DEFAULT_TIMEOUT'] = 300  # 5 minutes
app.config['STRICT_SLASHES'] = False
app.config['JSON_SORT_KEYS'] = False
app.config['PROPAGATE_EXCEPTIONS'] = True

# Security headers
@app.after_request
def set_security_headers(response):
    """Add security headers to all responses"""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
    return response

# Database engine options - only for PostgreSQL
if 'postgresql' in app.config['SQLALCHEMY_DATABASE_URI']:
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_size': 20,
        'max_overflow': 30,
        'pool_recycle': 1800,
        'pool_pre_ping': True,
        'pool_timeout': 10,
        'connect_args': {
            'connect_timeout': 10,
            'options': '-c statement_timeout=15000',
            'sslmode': 'require',
            'application_name': 'rentcar_app'
        }
    }
else:
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'connect_args': {'timeout': 15}
    }

# Try to use Redis cache if available, fallback to SimpleCache
try:
    import redis
    app.config['CACHE_TYPE'] = 'RedisCache'
    app.config['CACHE_REDIS_URL'] = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
except ImportError:
    pass

# Initialize extensions
from models import db
db.init_app(app)

# Configure CORS with strict settings
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
# Add localhost variants
cors_origins.extend(['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost', 'http://127.0.0.1'])

CORS(app, resources={
    r"/api/*": {
        "origins": cors_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": True,
        "max_age": 3600,
        "send_wildcard": False,
        "automatic_options": True
    }
})

# Add before_request handler to ensure CORS headers are set
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        response.headers.add("Access-Control-Allow-Origin", request.headers.get("Origin", "*"))
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 200

jwt = JWTManager(app)
cache = Cache(app)
compress = Compress(app)

# Create upload directory
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Import models after initializing db
from models import Car, Booking, ContactMessage, AdminUser, Category, Settings, User, UserBooking

# Import routes
from routes.cars import cars_bp
from routes.bookings import bookings_bp
from routes.contact import contact_bp
from routes.admin import admin_bp
from routes.auth import auth_bp
from routes.categories import categories_bp
from routes.telegram_admin import telegram_admin_bp
from routes.apk import apk_bp
from routes.user import user_bp

# Register blueprints
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(cars_bp, url_prefix='/api/cars')
app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
app.register_blueprint(contact_bp, url_prefix='/api/contact')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(categories_bp, url_prefix='/api/categories')
app.register_blueprint(telegram_admin_bp, url_prefix='/api/telegram')
app.register_blueprint(apk_bp, url_prefix='/api/apk')
app.register_blueprint(user_bp, url_prefix='/api/user')

# Serve uploaded files
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Upload endpoint
@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Upload file to server with image compression"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Secure filename
        filename = secure_filename(file.filename)
        # Add timestamp to make unique
        import time
        filename = f"{int(time.time())}_{filename}"
        
        # Compress image if it's an image file
        if file.content_type.startswith('image/'):
            from PIL import Image
            import io
            
            # Open image
            img = Image.open(file.stream)
            
            # Resize image - max width 800px, height proportional
            max_width = 800
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
            # Convert to RGB if needed (for JPEG)
            if img.mode in ('RGBA', 'LA', 'P'):
                rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                rgb_img.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = rgb_img
            
            # Save compressed image
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            img.save(filepath, 'JPEG', quality=85, optimize=True)
        else:
            # Save non-image files as is
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
        
        # Return URL - .env faylini qayta o'qish
        from dotenv import dotenv_values
        config = dotenv_values('.env')
        upload_url = config.get('UPLOAD_URL', 'http://localhost:5000/uploads')
        
        return jsonify({
            'success': True,
            'url': f"{upload_url}/{filename}",
            'filename': filename
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Health check endpoint
@app.route('/api/health')
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

# Test Telegram endpoint
@app.route('/api/test-telegram', methods=['GET'])
def test_telegram():
    """Test Telegram bot configuration"""
    from utils.telegram import send_test_message
    result = send_test_message()
    return jsonify(result)

# Error handlers
@app.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad request'}), 400

@app.errorhandler(401)
def unauthorized(error):
    return jsonify({'error': 'Unauthorized'}), 401

@app.errorhandler(403)
def forbidden(error):
    return jsonify({'error': 'Forbidden'}), 403

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

# Initialize database
def init_db():
    """Initialize database with sample data"""
    try:
        with app.app_context():
            # Create all tables
            db.create_all()
            
            # Check if admin user exists
            admin = AdminUser.query.filter_by(username=os.getenv('ADMIN_USERNAME', 'admin')).first()
            if not admin:
                admin = AdminUser(
                    username=os.getenv('ADMIN_USERNAME', 'admin'),
                    email='admin@rentcar.uz',
                    role='admin'
                )
                admin.set_password(os.getenv('ADMIN_PASSWORD', '101110'))
                db.session.add(admin)
            
            # Check if sample categories exist
            if Category.query.count() == 0:
                sample_categories = [
                    {
                        'name': 'Byudjetillar',
                        'slug': 'byudjetillar',
                        'description': 'Arzon va tejamkor avtomobillar',
                        'image': 'https://via.placeholder.com/300x200?text=Byudjetillar'
                    },
                    {
                        'name': 'Komfortli',
                        'slug': 'komfortli',
                        'description': 'Qulay va zamonaviy avtomobillar',
                        'image': 'https://via.placeholder.com/300x200?text=Komfortli'
                    },
                    {
                        'name': 'Premiumlar',
                        'slug': 'premiumlar',
                        'description': 'Hashamatli va yuqori sifatli avtomobillar',
                        'image': 'https://via.placeholder.com/300x200?text=Premiumlar'
                    },
                    {
                        'name': 'Krossoverlar',
                        'slug': 'krossoverlar',
                        'description': 'Kuchli va koʻp oʻrinli avtomobillar',
                        'image': 'https://via.placeholder.com/300x200?text=Krossoverlar'
                    }
                ]
                
                for cat_data in sample_categories:
                    category = Category(**cat_data)
                    db.session.add(category)
            
            # Sample cars are NOT added automatically
            # Admin can add cars manually through the admin panel
            
            db.session.commit()
            print("✅ Database initialized successfully!")
            print(f"Admin username: {os.getenv('ADMIN_USERNAME', 'admin')}")
            print(f"Admin password: {os.getenv('ADMIN_PASSWORD', '101110')}")
    
    except Exception as e:
        error_msg = str(e)
        
        # Check for specific connection errors
        if "could not translate host name" in error_msg:
            print("\n❌ DATABASE CONNECTION ERROR - INTERNET MUAMMOSI")
            print("=" * 60)
            print("SABAB: Kompyuteringiz internetga ulanmagan yoki DNS muammosi bor")
            print("\nYECHIM VARIANTLARI:")
            print("1. Internet ulanishini tekshiring")
            print("2. Firewall sozlamalarini tekshiring")
            print("3. VPN yoqib ko'ring")
            print("4. Lokal SQLite dan foydalaning:")
            print("   .env faylida: DATABASE_URL=sqlite:///rentcar.db")
            print("=" * 60 + "\n")
        
        elif "Connection refused" in error_msg:
            print("\n❌ DATABASE CONNECTION ERROR - SERVER JAVOB BERMAYAPTI")
            print("=" * 60)
            print("SABAB: Supabase server javob bermayapti")
            print("\nYECHIM:")
            print("1. Supabase server statusini tekshiring")
            print("2. Lokal SQLite dan foydalaning:")
            print("   .env faylida: DATABASE_URL=sqlite:///rentcar.db")
            print("=" * 60 + "\n")
        
        elif "timeout" in error_msg.lower():
            print("\n❌ DATABASE CONNECTION ERROR - ULANISH VAQTI TUGADI")
            print("=" * 60)
            print("SABAB: Server juda sekin javob bermoqda")
            print("\nYECHIM:")
            print("1. Internet tezligini tekshiring")
            print("2. Lokal SQLite dan foydalaning:")
            print("   .env faylida: DATABASE_URL=sqlite:///rentcar.db")
            print("=" * 60 + "\n")
        
        else:
            print(f"\n❌ DATABASE ERROR: {error_msg}\n")
        
        raise

if __name__ == '__main__':
    init_db()
    app.run(debug=False, host='0.0.0.0', port=5000, threaded=True)