"""
Security utilities for RentCar application
"""
import os
import re
from functools import wraps
from flask import request, jsonify
from datetime import datetime, timedelta
from collections import defaultdict
import hashlib

# Rate limiting storage
rate_limit_store = defaultdict(list)

class SecurityConfig:
    """Security configuration"""
    # Password requirements
    MIN_PASSWORD_LENGTH = int(os.getenv('PASSWORD_MIN_LENGTH', 8))
    REQUIRE_UPPERCASE = True
    REQUIRE_NUMBERS = True
    REQUIRE_SPECIAL_CHARS = True
    
    # Rate limiting
    RATE_LIMIT_ENABLED = os.getenv('RATE_LIMIT_ENABLED', 'true').lower() == 'true'
    RATE_LIMIT_REQUESTS = int(os.getenv('RATE_LIMIT_REQUESTS', 100))
    RATE_LIMIT_PERIOD = int(os.getenv('RATE_LIMIT_PERIOD', 3600))
    
    # Session
    SESSION_TIMEOUT = int(os.getenv('SESSION_TIMEOUT', 3600))
    
    # File upload
    ALLOWED_EXTENSIONS = set(os.getenv('ALLOWED_EXTENSIONS', 'jpg,jpeg,png,pdf').split(','))
    MAX_FILE_SIZE = int(os.getenv('MAX_FILE_SIZE', 5242880))

def validate_password(password):
    """
    Validate password strength
    Returns: (is_valid, error_message)
    """
    if len(password) < SecurityConfig.MIN_PASSWORD_LENGTH:
        return False, f"Parol kamida {SecurityConfig.MIN_PASSWORD_LENGTH} ta belgidan iborat bo'lishi kerak"
    
    if SecurityConfig.REQUIRE_UPPERCASE and not re.search(r'[A-Z]', password):
        return False, "Parol kamida bitta katta harf o'z ichiga olishi kerak"
    
    if SecurityConfig.REQUIRE_NUMBERS and not re.search(r'[0-9]', password):
        return False, "Parol kamida bitta raqam o'z ichiga olishi kerak"
    
    if SecurityConfig.REQUIRE_SPECIAL_CHARS and not re.search(r'[!@#$%^&*()_+\-=\[\]{};:\'",.<>?/\\|`~]', password):
        return False, "Parol kamida bitta maxsus belgi o'z ichiga olishi kerak (!@#$%^&* va h.k.)"
    
    return True, None

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone(phone):
    """Validate phone number format"""
    # Remove all non-digit characters
    digits = re.sub(r'\D', '', phone)
    # Check if it's between 10-15 digits
    return 10 <= len(digits) <= 15

def sanitize_input(data):
    """Sanitize user input to prevent XSS"""
    if isinstance(data, str):
        # Remove potentially dangerous characters
        data = data.replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;').replace("'", '&#x27;')
        return data.strip()
    elif isinstance(data, dict):
        return {k: sanitize_input(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_input(item) for item in data]
    return data

def rate_limit(max_requests=None, period=None):
    """
    Rate limiting decorator
    """
    max_requests = max_requests or SecurityConfig.RATE_LIMIT_REQUESTS
    period = period or SecurityConfig.RATE_LIMIT_PERIOD
    
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not SecurityConfig.RATE_LIMIT_ENABLED:
                return f(*args, **kwargs)
            
            # Get client IP
            client_ip = request.remote_addr
            endpoint = request.endpoint
            key = f"{client_ip}:{endpoint}"
            
            # Clean old requests
            now = datetime.utcnow()
            rate_limit_store[key] = [
                req_time for req_time in rate_limit_store[key]
                if (now - req_time).total_seconds() < period
            ]
            
            # Check rate limit
            if len(rate_limit_store[key]) >= max_requests:
                return jsonify({
                    'error': 'Juda ko\'p so\'rovlar yuborildi. Iltimos, biroz kutib turing.'
                }), 429
            
            # Add current request
            rate_limit_store[key].append(now)
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def hash_sensitive_data(data):
    """Hash sensitive data for logging"""
    return hashlib.sha256(str(data).encode()).hexdigest()[:16]

def validate_sql_injection(value):
    """Check for SQL injection patterns"""
    dangerous_patterns = [
        r"(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)",
        r"(--|;|\/\*|\*\/|xp_|sp_)",
        r"('|\")\s*(OR|AND)\s*('|\")",
    ]
    
    for pattern in dangerous_patterns:
        if re.search(pattern, str(value), re.IGNORECASE):
            return False
    return True

def log_security_event(event_type, details, severity='INFO'):
    """Log security events"""
    timestamp = datetime.utcnow().isoformat()
    log_message = f"[{timestamp}] [{severity}] {event_type}: {details}"
    print(log_message)
    
    # In production, send to logging service
    # logger.log(severity, log_message)

def check_authorization(required_role=None):
    """Check if user is authorized"""
    from flask_jwt_extended import get_jwt_identity
    
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                identity = get_jwt_identity()
                if not identity:
                    return jsonify({'error': 'Avtentifikatsiya kerak'}), 401
                
                # Add more role-based checks if needed
                return f(*args, **kwargs)
            except Exception as e:
                log_security_event('AUTHORIZATION_ERROR', str(e), 'WARNING')
                return jsonify({'error': 'Avtentifikatsiya xatosi'}), 401
        return decorated_function
    return decorator
