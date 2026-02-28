from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from models import db, AdminUser
from werkzeug.security import check_password_hash
from security import rate_limit, sanitize_input, log_security_event, validate_password
import os
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

# Track failed login attempts
failed_login_attempts = {}

@auth_bp.route('/login', methods=['POST'])
@rate_limit(max_requests=5, period=300)  # 5 attempts per 5 minutes
def login():
    """Admin login endpoint with security"""
    try:
        client_ip = request.remote_addr
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            log_security_event('LOGIN_ATTEMPT', f'Missing credentials from {client_ip}', 'WARNING')
            return jsonify({'error': 'Foydalanuvchi nomi va parol kerak'}), 400
        
        username = sanitize_input(data.get('username', ''))
        password = data.get('password', '')
        
        # Check for brute force attempts
        if client_ip in failed_login_attempts:
            attempts, last_attempt = failed_login_attempts[client_ip]
            if attempts >= 5 and (datetime.utcnow() - last_attempt).total_seconds() < 300:
                log_security_event('BRUTE_FORCE_ATTEMPT', f'Too many attempts from {client_ip}', 'CRITICAL')
                return jsonify({'error': 'Juda ko\'p noto\'g\'ri urinishlar. Iltimos, 5 daqiqadan keyin qayta urinib ko\'ring.'}), 429
        
        # Verify admin credentials
        admin_user = AdminUser.query.filter_by(username=username).first()
        
        if not admin_user or not admin_user.check_password(password):
            # Record failed attempt
            if client_ip not in failed_login_attempts:
                failed_login_attempts[client_ip] = [0, datetime.utcnow()]
            attempts, _ = failed_login_attempts[client_ip]
            failed_login_attempts[client_ip] = [attempts + 1, datetime.utcnow()]
            
            log_security_event('LOGIN_FAILED', f'Invalid credentials for user {username} from {client_ip}', 'WARNING')
            return jsonify({'error': 'Noto\'g\'ri foydalanuvchi nomi yoki parol'}), 401
        
        # Clear failed attempts on successful login
        if client_ip in failed_login_attempts:
            del failed_login_attempts[client_ip]
        
        # Create access token
        access_token = create_access_token(identity=str(admin_user.id))
        
        log_security_event('LOGIN_SUCCESS', f'Admin {username} logged in from {client_ip}', 'INFO')
        
        return jsonify({
            'success': True,
            'access_token': access_token,
            'user': admin_user.to_dict()
        }), 200
            
    except Exception as e:
        log_security_event('LOGIN_ERROR', str(e), 'ERROR')
        return jsonify({'error': 'Kirish xatosi'}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user info"""
    try:
        user_id = int(get_jwt_identity())
        admin_user = AdminUser.query.get(user_id)
        
        if not admin_user:
            return jsonify({'error': 'Foydalanuvchi topilmadi'}), 404
        
        return jsonify({
            'success': True,
            'user': admin_user.to_dict()
        }), 200
    except Exception as e:
        log_security_event('GET_USER_ERROR', str(e), 'ERROR')
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change admin password"""
    try:
        user_id = int(get_jwt_identity())
        admin_user = AdminUser.query.get(user_id)
        
        if not admin_user:
            return jsonify({'error': 'Foydalanuvchi topilmadi'}), 404
        
        data = request.get_json()
        
        if not data.get('old_password') or not data.get('new_password'):
            return jsonify({'error': 'Eski va yangi parol kerak'}), 400
        
        # Verify old password
        if not admin_user.check_password(data['old_password']):
            log_security_event('PASSWORD_CHANGE_FAILED', f'Invalid old password for user {admin_user.username}', 'WARNING')
            return jsonify({'error': 'Eski parol noto\'g\'ri'}), 401
        
        # Validate new password
        is_valid, error_msg = validate_password(data['new_password'])
        if not is_valid:
            return jsonify({'error': error_msg}), 400
        
        # Update password
        admin_user.set_password(data['new_password'])
        db.session.commit()
        
        log_security_event('PASSWORD_CHANGED', f'Password changed for user {admin_user.username}', 'INFO')
        
        return jsonify({
            'success': True,
            'message': 'Parol muvaffaqiyatli o\'zgartirildi'
        }), 200
    except Exception as e:
        db.session.rollback()
        log_security_event('PASSWORD_CHANGE_ERROR', str(e), 'ERROR')
        return jsonify({'error': str(e)}), 500
