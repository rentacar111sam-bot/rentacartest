from flask import Blueprint, request, jsonify, current_app
from models import Car, db, Settings, Category
from sqlalchemy import or_
from security import rate_limit
from datetime import datetime

cars_bp = Blueprint('cars', __name__)

@cars_bp.route('', methods=['GET'])
@rate_limit(max_requests=50, period=60)
def get_cars():
    """Get all cars with optional filtering - optimized"""
    try:
        # Get query parameters
        category = request.args.get('category', '')
        price_range = request.args.get('price_range', '')
        search = request.args.get('search', '')
        car_id = request.args.get('id', '')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 12, type=int)
        
        # Limit per_page to prevent abuse
        per_page = min(per_page, 100)
        
        # Base query - get all available cars with minimal data
        query = Car.query.filter_by(available=True)
        
        # Apply filters
        if car_id:
            query = query.filter(Car.id == car_id)
        
        if category and category in ['byudjetillar', 'komfortli', 'premiumlar', 'krossoverlar']:
            query = query.filter(Car.category == category)
        
        if search:
            query = query.filter(Car.name.ilike(f'%{search}%'))
        
        if price_range:
            if price_range == 'low':
                query = query.filter(Car.price < 150000)
            elif price_range == 'medium':
                query = query.filter(Car.price >= 150000, Car.price < 250000)
            elif price_range == 'high':
                query = query.filter(Car.price >= 250000)
        
        # Order by name
        query = query.order_by(Car.name)
        
        # Get total count
        total = query.count()
        
        # Pagination
        if car_id:
            cars = query.all()
            if cars:
                result = cars[0].to_dict()
            else:
                result = None
        else:
            cars = query.paginate(page=page, per_page=per_page, error_out=False).items
            result = {
                'cars': [car.to_dict() for car in cars],
                'total': total,
                'page': page,
                'per_page': per_page,
                'pages': (total + per_page - 1) // per_page
            }
        
        return jsonify(result), 200
        
    except Exception as e:
        import traceback
        print(f"Error in get_cars: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e), 'type': type(e).__name__}), 500

@cars_bp.route('', methods=['POST'])
def create_car():
    """Create a new car"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'category', 'price']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Field {field} is required'}), 400
        
        # Validate category enum
        valid_categories = ['byudjetillar', 'komfortli', 'premiumlar', 'krossoverlar']
        if data['category'] not in valid_categories:
            return jsonify({'error': f'Invalid category. Must be one of: {", ".join(valid_categories)}'}), 400
        
        # Create new car
        car = Car(
            name=data['name'],
            category=data['category'],
            price=float(data['price']),
            image=data.get('image', ''),
            features=data.get('features', []),
            year=data.get('year'),
            fuel=data.get('fuel', ''),
            transmission=data.get('transmission', ''),
            has_ac=data.get('has_ac', False),
            seats=data.get('seats', 5),
            fuel_consumption=data.get('fuel_consumption', 0.0),
            quantity=data.get('quantity', 1),
            available=data.get('available', True)
        )
        
        db.session.add(car)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'car_id': car.id,
            'message': 'Car created successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Error in create_car: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e), 'type': type(e).__name__}), 500

@cars_bp.route('/<int:car_id>', methods=['PUT'])
def update_car(car_id):
    """Update an existing car"""
    try:
        car = Car.query.get(car_id)
        
        if not car:
            return jsonify({'error': 'Avtomobil topilmadi'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        allowed_fields = ['name', 'category', 'price', 'image', 'features', 'year', 'fuel', 'transmission', 'available', 'has_ac', 'seats', 'fuel_consumption', 'quantity']
        
        for field in allowed_fields:
            if field in data:
                setattr(car, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Avtomobil tahrirlandi'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Error in update_car: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@cars_bp.route('/<int:car_id>', methods=['DELETE'])
def delete_car(car_id):
    """Delete a car (soft delete)"""
    try:
        car = Car.query.get(car_id)
        
        if not car:
            return jsonify({'error': 'Avtomobil topilmadi'}), 404
        
        # Check if car has active bookings
        from models import Booking
        active_bookings = Booking.query.filter(
            Booking.car_id == car_id,
            Booking.status.in_(['pending', 'confirmed'])
        ).count()
        
        if active_bookings > 0:
            return jsonify({'error': 'Faol bronlar bor, o\'chirib bo\'lmaydi'}), 400
        
        # Soft delete - set available to False
        car.available = False
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Avtomobil o\'chirildi'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Error in delete_car: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@cars_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all car categories"""
    categories = [
        {'value': 'byudjetillar', 'label': 'Byudjetillar'},
        {'value': 'komfortli', 'label': 'Komfortli'},
        {'value': 'premiumlar', 'label': 'Premiumlar'},
        {'value': 'krossoverlar', 'label': 'Krossoverlar'}
    ]
    return jsonify(categories)

@cars_bp.route('/admin/all', methods=['GET'])
def get_all_cars():
    """Get all available cars for admin"""
    try:
        # Get query parameters
        category = request.args.get('category', '')
        search = request.args.get('search', '')
        
        # Base query - get only available cars
        query = Car.query.filter_by(available=True)
        
        if category:
            query = query.filter(Car.category == category)
        
        if search:
            query = query.filter(Car.name.ilike(f'%{search}%'))
        
        # Order by name and limit results
        cars = query.order_by(Car.name).limit(100).all()
        result = [car.to_dict() for car in cars]
        
        return jsonify(result), 200
        
    except Exception as e:
        import traceback
        print(f"Error in get_all_cars: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e), 'type': type(e).__name__}), 500

@cars_bp.route('/payment-card', methods=['GET'])
def get_payment_card():
    """Get payment card information (public endpoint)"""
    try:
        card_number = Settings.query.filter_by(key='card_number').first()
        card_image = Settings.query.filter_by(key='card_image').first()
        
        return jsonify({
            'success': True,
            'card_number': card_number.value if card_number else None,
            'card_image': card_image.value if card_image else None
        })
    except Exception as e:
        print(f"Error getting payment card: {e}")
        return jsonify({'error': str(e)}), 500