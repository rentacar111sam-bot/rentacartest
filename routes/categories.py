from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Category
from datetime import datetime
from security import rate_limit, sanitize_input, log_security_event

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('', methods=['GET'])
@rate_limit(max_requests=50, period=60)
def get_categories():
    """Get all categories"""
    try:
        categories = Category.query.order_by(Category.name).all()
        return jsonify([cat.to_dict() for cat in categories]), 200
    except Exception as e:
        log_security_event('GET_CATEGORIES_ERROR', str(e), 'ERROR')
        return jsonify({'error': str(e)}), 500

@categories_bp.route('', methods=['POST'])
@jwt_required()
@rate_limit(max_requests=10, period=60)
def create_category():
    """Create a new category (max 4)"""
    try:
        user_id = int(get_jwt_identity())
        
        # Check if user is admin
        from models import AdminUser
        admin_user = AdminUser.query.get(user_id)
        if not admin_user or admin_user.role != 'admin':
            log_security_event('UNAUTHORIZED_CATEGORY_CREATE', f'User {user_id} tried to create category', 'WARNING')
            return jsonify({'error': 'Avtorizatsiya kerak'}), 401
        
        # Check max categories
        category_count = Category.query.count()
        if category_count >= 4:
            log_security_event('MAX_CATEGORIES_REACHED', f'Attempted to create category when max reached', 'WARNING')
            return jsonify({'error': '4 ta kategoriyadan ko\'proq qo\'sha olmaysiz'}), 400
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name') or not data.get('slug') or not data.get('description'):
            return jsonify({'error': 'Barcha majburiy maydonlarni to\'ldiring'}), 400
        
        # Sanitize inputs
        name = sanitize_input(data.get('name', ''))
        slug = sanitize_input(data.get('slug', ''))
        description = sanitize_input(data.get('description', ''))
        image = sanitize_input(data.get('image', ''))
        
        # Check if slug already exists
        existing = Category.query.filter_by(slug=slug).first()
        if existing:
            return jsonify({'error': 'Bu slug allaqachon mavjud'}), 400
        
        # Create category
        category = Category(
            name=name,
            slug=slug,
            description=description,
            image=image
        )
        
        db.session.add(category)
        db.session.commit()
        
        log_security_event('CATEGORY_CREATED', f'Category {name} created by admin {user_id}', 'INFO')
        
        return jsonify({
            'success': True,
            'message': 'Kategoriya qo\'shildi',
            'category': category.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        log_security_event('CREATE_CATEGORY_ERROR', str(e), 'ERROR')
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/<int:category_id>', methods=['PUT'])
@jwt_required()
@rate_limit(max_requests=10, period=60)
def update_category(category_id):
    """Update a category"""
    try:
        user_id = int(get_jwt_identity())
        
        # Check if user is admin
        from models import AdminUser
        admin_user = AdminUser.query.get(user_id)
        if not admin_user or admin_user.role != 'admin':
            log_security_event('UNAUTHORIZED_CATEGORY_UPDATE', f'User {user_id} tried to update category', 'WARNING')
            return jsonify({'error': 'Avtorizatsiya kerak'}), 401
        
        category = Category.query.get(category_id)
        if not category:
            return jsonify({'error': 'Kategoriya topilmadi'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            category.name = sanitize_input(data['name'])
        
        if 'slug' in data:
            new_slug = sanitize_input(data['slug'])
            # Check if new slug already exists
            existing = Category.query.filter_by(slug=new_slug).filter(Category.id != category_id).first()
            if existing:
                return jsonify({'error': 'Bu slug allaqachon mavjud'}), 400
            category.slug = new_slug
        
        if 'description' in data:
            category.description = sanitize_input(data['description'])
        
        if 'image' in data:
            category.image = sanitize_input(data['image'])
        
        category.updated_at = datetime.utcnow()
        db.session.commit()
        
        log_security_event('CATEGORY_UPDATED', f'Category {category.name} updated by admin {user_id}', 'INFO')
        
        return jsonify({
            'success': True,
            'message': 'Kategoriya tahrirlandi',
            'category': category.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        log_security_event('UPDATE_CATEGORY_ERROR', str(e), 'ERROR')
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/<int:category_id>', methods=['DELETE'])
@jwt_required()
@rate_limit(max_requests=10, period=60)
def delete_category(category_id):
    """Delete a category (min 1 must remain)"""
    try:
        user_id = int(get_jwt_identity())
        
        # Check if user is admin
        from models import AdminUser
        admin_user = AdminUser.query.get(user_id)
        if not admin_user or admin_user.role != 'admin':
            log_security_event('UNAUTHORIZED_CATEGORY_DELETE', f'User {user_id} tried to delete category', 'WARNING')
            return jsonify({'error': 'Avtorizatsiya kerak'}), 401
        
        category = Category.query.get(category_id)
        if not category:
            return jsonify({'error': 'Kategoriya topilmadi'}), 404
        
        # Check if this is the last category
        category_count = Category.query.count()
        if category_count <= 1:
            return jsonify({'error': 'Kamida 1 ta kategoriya bo\'lishi kerak'}), 400
        
        category_name = category.name
        db.session.delete(category)
        db.session.commit()
        
        log_security_event('CATEGORY_DELETED', f'Category {category_name} deleted by admin {user_id}', 'INFO')
        
        return jsonify({
            'success': True,
            'message': 'Kategoriya o\'chirildi'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        log_security_event('DELETE_CATEGORY_ERROR', str(e), 'ERROR')
        return jsonify({'error': str(e)}), 500
