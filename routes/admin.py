from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Car, Booking, ContactMessage, AdminUser, Settings, Category, User, UserBooking
from datetime import datetime, date, timedelta
from sqlalchemy import func
from security import rate_limit, sanitize_input, log_security_event

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@rate_limit(max_requests=30, period=60)
def get_dashboard():
    """Get admin dashboard statistics"""
    try:
        user_id = int(get_jwt_identity())
        admin_user = AdminUser.query.get(user_id)
        
        if not admin_user:
            return jsonify({'error': 'Foydalanuvchi topilmadi'}), 404
        
        today = date.today()
        
        # Total cars (only available cars)
        total_cars = Car.query.filter_by(available=True).count()
        
        # Total categories
        total_categories = Category.query.count()
        
        # Today's bookings
        today_bookings = Booking.query.filter(
            func.date(Booking.created_at) == today
        ).count()
        
        # Monthly revenue (completed bookings this month)
        first_day_of_month = today.replace(day=1)
        monthly_revenue = db.session.query(func.sum(Booking.total_amount)).filter(
            Booking.status == 'completed',
            Booking.created_at >= first_day_of_month
        ).scalar() or 0
        
        # Most rented car
        most_rented = db.session.query(
            Car.id,
            Car.name,
            Car.image,
            func.count(Booking.id).label('rental_count')
        ).join(Booking).filter(
            Booking.status.in_(['completed', 'confirmed'])
        ).group_by(Car.id).order_by(func.count(Booking.id).desc()).first()
        
        # Booking stats
        total_bookings = Booking.query.count()
        pending_bookings = Booking.query.filter_by(status='pending').count()
        confirmed_bookings = Booking.query.filter_by(status='confirmed').count()
        completed_bookings = Booking.query.filter_by(status='completed').count()
        cancelled_bookings = Booking.query.filter_by(status='cancelled').count()
        
        # Revenue by month (last 6 months)
        revenue_by_month = []
        for i in range(5, -1, -1):
            month_date = today - timedelta(days=30*i)
            month_start = month_date.replace(day=1)
            if i == 0:
                month_end = today
            else:
                next_month = month_date + timedelta(days=32)
                month_end = next_month.replace(day=1) - timedelta(days=1)
            
            revenue = db.session.query(func.sum(Booking.total_amount)).filter(
                Booking.status == 'completed',
                Booking.created_at >= month_start,
                Booking.created_at <= month_end
            ).scalar() or 0
            
            revenue_by_month.append({
                'month': month_start.strftime('%b'),
                'revenue': float(revenue)
            })
        
        # Top 5 most rented cars
        top_cars = db.session.query(
            Car.id,
            Car.name,
            Car.image,
            func.count(Booking.id).label('rental_count')
        ).join(Booking).filter(
            Booking.status.in_(['completed', 'confirmed'])
        ).group_by(Car.id).order_by(func.count(Booking.id).desc()).limit(5).all()
        
        stats = {
            'total_cars': total_cars,
            'total_categories': total_categories,
            'today_bookings': today_bookings,
            'monthly_revenue': float(monthly_revenue),
            'most_rented_car': {
                'id': most_rented[0],
                'name': most_rented[1],
                'image': most_rented[2],
                'rental_count': most_rented[3]
            } if most_rented else None,
            'total_bookings': total_bookings,
            'pending_bookings': pending_bookings,
            'confirmed_bookings': confirmed_bookings,
            'completed_bookings': completed_bookings,
            'cancelled_bookings': cancelled_bookings,
            'active_bookings': pending_bookings + confirmed_bookings,
            'revenue_by_month': revenue_by_month,
            'top_cars': [
                {
                    'id': car[0],
                    'name': car[1],
                    'image': car[2],
                    'rental_count': car[3]
                } for car in top_cars
            ]
        }
        
        return jsonify(stats)
    except Exception as e:
        print(f"Dashboard error: {e}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/bookings', methods=['GET'])
@jwt_required()
def get_admin_bookings():
    """Get all bookings with filters"""
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        status = request.args.get('status', '')
        
        query = Booking.query
        
        if status:
            query = query.filter_by(status=status)
        
        total = query.count()
        bookings = query.order_by(Booking.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
        
        return jsonify({
            'bookings': [b.to_dict() for b in bookings],
            'total': total,
            'page': page,
            'limit': limit
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/bookings/<booking_id>/status', methods=['PUT'])
@jwt_required()
def update_booking_status(booking_id):
    """Update booking status"""
    try:
        booking = Booking.query.filter_by(booking_id=booking_id).first_or_404()
        car = Car.query.get(booking.car_id)
        data = request.get_json()
        
        if 'status' in data:
            old_status = booking.status
            new_status = data['status']
            
            booking.status = new_status
            booking.updated_at = datetime.utcnow()
            db.session.commit()
            
            # Send Telegram notification about status change
            try:
                from utils.telegram import send_booking_status_update
                send_booking_status_update(booking, car, old_status, new_status)
            except Exception as e:
                print(f"Failed to send Telegram status update: {e}")
        
        return jsonify({'success': True, 'message': 'Booking status updated'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/cars', methods=['GET'])
@jwt_required()
def get_admin_cars():
    """Get all cars for admin"""
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        category = request.args.get('category', '')
        
        print(f"DEBUG: Getting admin cars - page={page}, limit={limit}, category={category}")
        
        query = Car.query.filter_by(available=True)
        
        if category:
            query = query.filter_by(category=category)
        
        total = query.count()
        cars = query.order_by(Car.name).offset((page - 1) * limit).limit(limit).all()
        
        print(f"DEBUG: Found {len(cars)} cars")
        
        return jsonify({
            'cars': [c.to_dict() for c in cars],
            'total': total,
            'page': page,
            'limit': limit
        })
    except Exception as e:
        print(f"DEBUG: Error in get_admin_cars: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/cars', methods=['POST'])
@jwt_required()
def create_admin_car():
    """Create a new car"""
    try:
        data = request.get_json()
        print(f"DEBUG: Received data: {data}")
        print(f"DEBUG: Category value: {data.get('category')}")
        
        # Validate category
        valid_categories = ['byudjetillar', 'komfortli', 'premiumlar', 'krossoverlar']
        if data.get('category') not in valid_categories:
            return jsonify({'error': f'Invalid category. Must be one of: {", ".join(valid_categories)}'}), 400
        
        car = Car(
            name=data['name'],
            category=data['category'],
            price=data['price'],
            image=data.get('image', ''),
            features=data.get('features', []),
            year=data.get('year'),
            fuel=data.get('fuel', ''),
            transmission=data.get('transmission', ''),
            has_ac=data.get('has_ac', False),
            seats=data.get('seats', 5),
            quantity=data.get('quantity', 1)
        )
        
        db.session.add(car)
        db.session.commit()
        
        return jsonify({'success': True, 'car_id': car.id}), 201
    except Exception as e:
        db.session.rollback()
        print(f"DEBUG: Error creating car: {e}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/cars/<int:car_id>', methods=['PUT'])
@jwt_required()
def update_admin_car(car_id):
    """Update a car"""
    try:
        car = Car.query.get_or_404(car_id)
        data = request.get_json()
        
        allowed_fields = ['name', 'category', 'price', 'image', 'features', 'year', 'fuel', 'transmission', 'available', 'quantity', 'seats', 'has_ac']
        
        for field in allowed_fields:
            if field in data:
                setattr(car, field, data[field])
        
        car.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Car updated'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/cars/<int:car_id>', methods=['DELETE'])
@jwt_required()
def delete_admin_car(car_id):
    """Delete a car"""
    try:
        car = Car.query.get_or_404(car_id)
        car.available = False
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Car deleted'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/messages', methods=['GET'])
@jwt_required()
def get_admin_messages():
    """Get all contact messages"""
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        status = request.args.get('status', '')
        
        query = ContactMessage.query
        
        if status:
            query = query.filter_by(status=status)
        
        total = query.count()
        messages = query.order_by(ContactMessage.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
        
        return jsonify({
            'messages': [m.to_dict() for m in messages],
            'total': total,
            'page': page,
            'limit': limit
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/messages/<int:message_id>/status', methods=['PUT'])
@jwt_required()
def update_message_status(message_id):
    """Update message status"""
    try:
        message = ContactMessage.query.get_or_404(message_id)
        data = request.get_json()
        
        if 'status' in data:
            message.status = data['status']
            db.session.commit()
        
        return jsonify({'success': True, 'message': 'Message status updated'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/stats', methods=['GET'])
def get_dashboard_stats():
    """Get dashboard statistics (public endpoint for admin panel)"""
    try:
        today = date.today()
        
        # Total cars (only available cars)
        total_cars = Car.query.filter_by(available=True).count()
        
        # Total categories
        total_categories = Category.query.count()
        
        # Total users
        total_users = User.query.count()
        
        # Today's bookings
        today_bookings = Booking.query.filter(
            func.date(Booking.created_at) == today
        ).count()
        
        # Monthly revenue (completed bookings this month)
        first_day_of_month = today.replace(day=1)
        monthly_revenue = db.session.query(func.sum(Booking.total_amount)).filter(
            Booking.status == 'completed',
            Booking.created_at >= first_day_of_month
        ).scalar() or 0
        
        # Most rented car
        most_rented = db.session.query(
            Car.id,
            Car.name,
            Car.image,
            func.count(Booking.id).label('rental_count')
        ).join(Booking).filter(
            Booking.status.in_(['completed', 'confirmed'])
        ).group_by(Car.id).order_by(func.count(Booking.id).desc()).first()
        
        # Booking stats
        total_bookings = Booking.query.count()
        pending_bookings = Booking.query.filter_by(status='pending').count()
        confirmed_bookings = Booking.query.filter_by(status='confirmed').count()
        completed_bookings = Booking.query.filter_by(status='completed').count()
        cancelled_bookings = Booking.query.filter_by(status='cancelled').count()
        
        # Revenue by month (last 6 months)
        revenue_by_month = []
        for i in range(5, -1, -1):
            month_date = today - timedelta(days=30*i)
            month_start = month_date.replace(day=1)
            if i == 0:
                month_end = today
            else:
                next_month = month_date + timedelta(days=32)
                month_end = next_month.replace(day=1) - timedelta(days=1)
            
            revenue = db.session.query(func.sum(Booking.total_amount)).filter(
                Booking.status == 'completed',
                Booking.created_at >= month_start,
                Booking.created_at <= month_end
            ).scalar() or 0
            
            revenue_by_month.append({
                'month': month_start.strftime('%b'),
                'revenue': float(revenue)
            })
        
        # Top 5 most rented cars
        top_cars = db.session.query(
            Car.id,
            Car.name,
            Car.image,
            func.count(Booking.id).label('rental_count')
        ).join(Booking).filter(
            Booking.status.in_(['completed', 'confirmed'])
        ).group_by(Car.id).order_by(func.count(Booking.id).desc()).limit(5).all()
        
        return jsonify({
            'total_cars': total_cars,
            'total_categories': total_categories,
            'total_users': total_users,
            'today_bookings': today_bookings,
            'monthly_revenue': float(monthly_revenue),
            'most_rented_car': {
                'id': most_rented[0],
                'name': most_rented[1],
                'image': most_rented[2],
                'rental_count': most_rented[3]
            } if most_rented else None,
            'total_bookings': total_bookings,
            'pending_bookings': pending_bookings,
            'confirmed_bookings': confirmed_bookings,
            'completed_bookings': completed_bookings,
            'cancelled_bookings': cancelled_bookings,
            'active_bookings': pending_bookings + confirmed_bookings,
            'revenue_by_month': revenue_by_month,
            'top_cars': [
                {
                    'id': car[0],
                    'name': car[1],
                    'image': car[2],
                    'rental_count': car[3]
                } for car in top_cars
            ]
        })
    except Exception as e:
        print(f"Stats error: {e}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/settings', methods=['GET'])
@jwt_required()
def get_settings():
    """Get all settings"""
    try:
        settings = Settings.query.all()
        settings_dict = {s.key: s.value for s in settings}
        return jsonify({
            'success': True,
            'settings': settings_dict
        })
    except Exception as e:
        print(f"Get settings error: {e}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/settings', methods=['PUT'])
@jwt_required()
def update_settings():
    """Update settings"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        for key, value in data.items():
            setting = Settings.query.filter_by(key=key).first()
            if setting:
                setting.value = value
                setting.updated_at = datetime.utcnow()
            else:
                setting = Settings(key=key, value=value)
                db.session.add(setting)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Settings updated successfully'
        })
    except Exception as e:
        db.session.rollback()
        print(f"Update settings error: {e}")
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/users', methods=['GET'])
def get_admin_users():
    """Get all users for admin (public endpoint)"""
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        search = request.args.get('search', '')
        
        query = User.query
        
        if search:
            query = query.filter(
                db.or_(
                    User.first_name.ilike(f'%{search}%'),
                    User.last_name.ilike(f'%{search}%'),
                    User.phone.ilike(f'%{search}%'),
                    User.email.ilike(f'%{search}%')
                )
            )
        
        total = query.count()
        users = query.order_by(User.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
        
        # Get booking count for each user
        users_data = []
        for user in users:
            booking_count = UserBooking.query.filter_by(user_id=user.id).count()
            user_dict = user.to_dict()
            user_dict['booking_count'] = booking_count
            
            # Get last booking date
            last_booking = UserBooking.query.filter_by(user_id=user.id).order_by(UserBooking.created_at.desc()).first()
            user_dict['last_booking_date'] = last_booking.created_at.isoformat() if last_booking else None
            
            # Determine user status
            if booking_count == 0:
                user_dict['status'] = 'new'
                user_dict['status_text'] = 'Yangi mijoz'
            elif booking_count >= 5:
                user_dict['status'] = 'vip'
                user_dict['status_text'] = 'Doimiy mijoz'
            else:
                user_dict['status'] = 'regular'
                user_dict['status_text'] = 'Oddiy mijoz'
            
            users_data.append(user_dict)
        
        return jsonify({
            'users': users_data,
            'total': total,
            'page': page,
            'limit': limit
        })
    except Exception as e:
        print(f"Get users error: {e}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete a user"""
    try:
        user = User.query.get_or_404(user_id)
        
        # Delete user bookings first
        UserBooking.query.filter_by(user_id=user_id).delete()
        
        # Delete user
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Foydalanuvchi o\'chirildi'
        })
    except Exception as e:
        db.session.rollback()
        print(f"Delete user error: {e}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/change-password', methods=['POST'])
def change_admin_password():
    """Change admin panel password"""
    try:
        data = request.get_json()
        new_password = data.get('password')
        
        print(f"DEBUG: Changing password to: {new_password}")
        
        if not new_password or len(new_password) < 4:
            return jsonify({'error': 'Parol kamida 4 ta belgidan iborat bo\'lishi kerak'}), 400
        
        # Update or create password setting
        setting = Settings.query.filter_by(key='admin_password').first()
        if setting:
            setting.value = new_password
            setting.updated_at = datetime.utcnow()
            print(f"DEBUG: Updated existing setting")
        else:
            setting = Settings(key='admin_password', value=new_password)
            db.session.add(setting)
            print(f"DEBUG: Created new setting")
        
        db.session.commit()
        print(f"DEBUG: Password saved successfully")
        
        return jsonify({
            'success': True,
            'message': 'Admin paroli muvaffaqiyatli o\'zgartirildi'
        })
    except Exception as e:
        db.session.rollback()
        print(f"Change password error: {e}")
        return jsonify({'error': str(e)}), 500
        return jsonify({'error': str(e)}), 500
