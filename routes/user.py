from flask import Blueprint, request, jsonify
from models import User, db
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime

user_bp = Blueprint('user', __name__)

@user_bp.route('/register', methods=['POST'])
def register():
    """Register new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('phone') or not data.get('password'):
            return jsonify({'error': 'Telefon va parol kerak'}), 400
        
        # Check if user exists
        if User.query.filter_by(phone=data['phone']).first():
            return jsonify({'error': 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan'}), 400
        
        # Create user
        user = User(
            phone=data['phone'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            email=f"{data['phone']}@rentcar.uz"  # Default email
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Create token with string identity
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'success': True,
            'message': 'Ro\'yxatdan o\'tish muvaffaqiyatli',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('phone') or not data.get('password'):
            return jsonify({'error': 'Telefon va parol kerak'}), 400
        
        # Find user
        user = User.query.filter_by(phone=data['phone']).first()
        
        # Check if user exists
        if not user:
            return jsonify({'error': 'Bu telefon raqam ro\'yxatdan o\'tmagan. Iltimos, ro\'yxatdan o\'ting'}), 404
        
        # Check password
        if not user.check_password(data['password']):
            return jsonify({'error': 'Parol noto\'g\'ri'}), 401
        
        # Create token with string identity
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'success': True,
            'message': 'Kirish muvaffaqiyatli',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get user profile"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Foydalanuvchi topilmadi'}), 404
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Foydalanuvchi topilmadi'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'bio' in data:
            user.bio = data['bio']
        if 'profile_image' in data:
            user.profile_image = data['profile_image']
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Profil yangilandi',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/profile', methods=['DELETE'])
@jwt_required()
def delete_profile():
    """Delete user account"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Foydalanuvchi topilmadi'}), 404
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Akkaunt o\'chirildi'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Foydalanuvchi topilmadi'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('new_password'):
            return jsonify({'error': 'Yangi parol kerak'}), 400
        
        # Validate new password
        if len(data['new_password']) < 6:
            return jsonify({'error': 'Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak'}), 400
        
        # Set new password
        user.set_password(data['new_password'])
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Parol muvaffaqiyatli o\'zgartirildi'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Akkaunt o\'chirildi'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/bookings', methods=['GET'])
@jwt_required()
def get_user_bookings():
    """Get user's bookings"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Foydalanuvchi topilmadi'}), 404
        
        bookings = [ub.booking.to_dict() for ub in user.bookings]
        
        return jsonify({
            'success': True,
            'bookings': bookings
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
