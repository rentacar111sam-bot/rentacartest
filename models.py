from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from decimal import Decimal
import json

# Initialize db here
db = SQLAlchemy()

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    slug = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)
    image = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description or '',
            'image': self.image or '',
            'created_at': self.created_at.isoformat() if self.created_at else datetime.utcnow().isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else datetime.utcnow().isoformat()
        }

class Car(db.Model):
    __tablename__ = 'cars'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    category = db.Column(db.Enum('byudjetillar', 'komfortli', 'premiumlar', 'krossoverlar', name='car_category'), nullable=False)
    price = db.Column(db.Float, nullable=False)
    image = db.Column(db.String(500))
    features = db.Column(db.JSON)
    year = db.Column(db.Integer)
    fuel = db.Column(db.String(50))
    transmission = db.Column(db.String(50))
    has_ac = db.Column(db.Boolean, default=False)
    seats = db.Column(db.Integer, default=5)
    fuel_consumption = db.Column(db.Float, default=0.0)
    quantity = db.Column(db.Integer, default=1)
    available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    bookings = db.relationship('Booking', backref='car', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'price': float(self.price) if self.price else 0,
            'image': self.image or '',
            'features': self.features or [],
            'year': self.year or 0,
            'fuel': self.fuel or '',
            'transmission': self.transmission or '',
            'has_ac': bool(self.has_ac),
            'seats': self.seats or 5,
            'fuel_consumption': float(self.fuel_consumption) if self.fuel_consumption else 0.0,
            'quantity': self.quantity or 1,
            'available': bool(self.available),
            'created_at': self.created_at.isoformat() if self.created_at else datetime.utcnow().isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else datetime.utcnow().isoformat()
        }

class Booking(db.Model):
    __tablename__ = 'bookings'
    
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.String(50), unique=True, nullable=False)
    car_id = db.Column(db.Integer, db.ForeignKey('cars.id'), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(255), nullable=True)  # Made optional
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    total_days = db.Column(db.Integer, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    deposit_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.Enum('pending', 'confirmed', 'completed', 'cancelled', name='booking_status'), default='pending')
    passport_front = db.Column(db.String(500), nullable=True)  # Not used - files sent via Telegram only
    passport_back = db.Column(db.String(500), nullable=True)   # Not used - files sent via Telegram only
    driver_license = db.Column(db.String(500), nullable=True)  # Not used - files sent via Telegram only
    payment_receipt = db.Column(db.String(500), nullable=True) # Not used - files sent via Telegram only
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'car_id': self.car_id,
            'car_name': self.car.name if self.car else '',
            'car_image': self.car.image if self.car else '',
            'user_name': f"{self.first_name} {self.last_name}",
            'user_phone': self.phone,
            'user_email': self.email or '',
            'first_name': self.first_name or '',
            'last_name': self.last_name or '',
            'phone': self.phone or '',
            'email': self.email or '',
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'total_days': self.total_days or 0,
            'total_amount': float(self.total_amount) if self.total_amount else 0,
            'deposit_amount': float(self.deposit_amount) if self.deposit_amount else 0,
            'status': self.status or 'pending',
            'created_at': self.created_at.isoformat() if self.created_at else datetime.utcnow().isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else datetime.utcnow().isoformat()
        }

class ContactMessage(db.Model):
    __tablename__ = 'contact_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    subject = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.Enum('new', 'read', 'replied', name='message_status'), default='new')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name or '',
            'phone': self.phone or '',
            'email': self.email or '',
            'subject': self.subject or '',
            'message': self.message or '',
            'status': self.status or 'new',
            'created_at': self.created_at.isoformat() if self.created_at else datetime.utcnow().isoformat()
        }

class AdminUser(db.Model):
    __tablename__ = 'admin_users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    role = db.Column(db.Enum('admin', 'manager', name='user_role'), default='admin')
    is_active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)
    
    def check_password(self, password):
        """Check if password matches hash"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username or '',
            'email': self.email or '',
            'role': self.role or 'admin',
            'is_active': bool(self.is_active),
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat() if self.created_at else datetime.utcnow().isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else datetime.utcnow().isoformat()
        }

class Settings(db.Model):
    __tablename__ = 'settings'
    
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), unique=True, nullable=False)
    value = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'key': self.key or '',
            'value': self.value or '',
            'created_at': self.created_at.isoformat() if self.created_at else datetime.utcnow().isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else datetime.utcnow().isoformat()
        }


class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    phone = db.Column(db.String(20), unique=True, nullable=False)
    profile_image = db.Column(db.String(500))
    bio = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    bookings = db.relationship('UserBooking', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)
    
    def check_password(self, password):
        """Check if password matches hash"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email or '',
            'first_name': self.first_name or '',
            'last_name': self.last_name or '',
            'phone': self.phone or '',
            'profile_image': self.profile_image or '',
            'bio': self.bio or '',
            'is_active': bool(self.is_active),
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat() if self.created_at else datetime.utcnow().isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else datetime.utcnow().isoformat()
        }

class UserBooking(db.Model):
    __tablename__ = 'user_bookings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    booking = db.relationship('Booking', backref='user_booking')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id or 0,
            'booking_id': self.booking_id or 0,
            'created_at': self.created_at.isoformat() if self.created_at else datetime.utcnow().isoformat()
        }
