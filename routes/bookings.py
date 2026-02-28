from flask import Blueprint, request, jsonify, current_app
from models import Booking, Car, db
from datetime import datetime, date
from werkzeug.utils import secure_filename
import os
import uuid
from utils.telegram import send_telegram_notification
from utils.file_upload import handle_file_upload, validate_file
from security import rate_limit, sanitize_input, validate_phone, validate_email, log_security_event

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('', methods=['GET'], strict_slashes=False)
@bookings_bp.route('/', methods=['GET'], strict_slashes=False)
@rate_limit(max_requests=30, period=60)
def get_bookings():
    """Get all bookings with optional filtering"""
    try:
        # Get query parameters
        booking_id = request.args.get('id', '')
        status = request.args.get('status', '')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        # Validate pagination
        if page < 1 or limit < 1 or limit > 100:
            return jsonify({'error': 'Noto\'g\'ri sahifa yoki limit'}), 400
        
        # Sanitize inputs
        booking_id = sanitize_input(booking_id)
        status = sanitize_input(status)
        
        # Base query with eager loading
        query = db.session.query(Booking).options(
            db.joinedload(Booking.car)
        )
        
        # Apply filters
        if booking_id:
            query = query.filter(Booking.booking_id == booking_id)
        
        if status and status in ['pending', 'confirmed', 'completed', 'cancelled']:
            query = query.filter(Booking.status == status)
        
        # Order by creation date (newest first)
        query = query.order_by(Booking.created_at.desc())
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        bookings = query.offset(offset).limit(limit).all()
        
        if booking_id and bookings:
            return jsonify(bookings[0].to_dict())
        
        return jsonify({
            'bookings': [booking.to_dict() for booking in bookings],
            'total': total_count,
            'page': page,
            'limit': limit
        })
        
    except Exception as e:
        log_security_event('GET_BOOKINGS_ERROR', str(e), 'ERROR')
        return jsonify({'error': str(e)}), 500

@bookings_bp.route('/', methods=['POST'])
@rate_limit(max_requests=10, period=60)
def create_booking():
    """Create a new booking with security validation"""
    try:
        # Get form data
        data = request.form.to_dict()
        files = request.files
        
        # Sanitize all inputs
        data = {k: sanitize_input(v) for k, v in data.items()}
        
        # Validate required fields
        car_id_value = data.get('carId') or data.get('car_id')
        start_date_value = data.get('startDate') or data.get('start_date')
        end_date_value = data.get('endDate') or data.get('end_date')
        first_name_value = data.get('firstName') or data.get('first_name')
        last_name_value = data.get('lastName') or data.get('last_name')
        phone_value = data.get('phone')
        
        required_fields = {
            'carId': car_id_value,
            'startDate': start_date_value,
            'endDate': end_date_value,
            'firstName': first_name_value,
            'lastName': last_name_value,
            'phone': phone_value
        }
        
        missing_fields = [field for field, value in required_fields.items() if not value]
        
        if missing_fields:
            error_msg = f'Majburiy maydonlar yo\'q: {", ".join(missing_fields)}'
            log_security_event('BOOKING_VALIDATION_ERROR', error_msg, 'WARNING')
            return jsonify({'error': error_msg}), 400
        
        # Validate phone number
        if not validate_phone(phone_value):
            return jsonify({'error': 'Noto\'g\'ri telefon raqami'}), 400
        
        # Validate email if provided
        email_value = data.get('email', '')
        if email_value and not validate_email(email_value):
            return jsonify({'error': 'Noto\'g\'ri email'}), 400
        
        # Parse and validate dates
        try:
            start_date = datetime.strptime(start_date_value, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_value, '%Y-%m-%d').date()
        except ValueError as e:
            return jsonify({'error': 'Noto\'g\'ri sana formati. YYYY-MM-DD formatida kiriting'}), 400
        
        if start_date >= end_date:
            return jsonify({'error': 'Tugash sanasi boshlanish sanasidan keyin bo\'lishi kerak'}), 400
        
        if start_date < date.today():
            return jsonify({'error': 'Boshlanish sanasi bugundan keyin bo\'lishi kerak'}), 400
        
        # Validate car exists and is available
        try:
            car_id = int(car_id_value)
        except (ValueError, TypeError):
            return jsonify({'error': 'Noto\'g\'ri avtomobil ID'}), 400
        
        car = Car.query.filter_by(id=car_id, available=True).first()
        if not car:
            return jsonify({'error': 'Avtomobil topilmadi yoki mavjud emas'}), 404
        
        # Check if car is available for the selected dates
        conflicting_bookings = Booking.query.filter(
            Booking.car_id == car_id,
            Booking.status.in_(['pending', 'confirmed']),
            db.or_(
                db.and_(Booking.start_date <= start_date, Booking.end_date >= start_date),
                db.and_(Booking.start_date <= end_date, Booking.end_date >= end_date),
                db.and_(Booking.start_date >= start_date, Booking.end_date <= end_date)
            )
        ).first()
        
        if conflicting_bookings:
            return jsonify({'error': 'Avtomobil tanlangan sanalar uchun mavjud emas'}), 400
        
        # Calculate amounts
        total_days = (end_date - start_date).days
        total_amount = float(car.price) * total_days
        deposit_amount = total_amount * 0.6
        
        # Validate file uploads
        is_admin_booking = data.get('is_admin') == 'true'
        uploaded_files = {}
        required_files = ['passportFront', 'passportBack', 'paymentReceipt']
        optional_files = ['driverLicense']
        
        for file_field in required_files:
            if file_field not in request.files:
                if not is_admin_booking:
                    return jsonify({'error': f'{file_field} fayli majburiy'}), 400
                uploaded_files[file_field] = None
                continue
            
            file = request.files[file_field]
            if file.filename == '':
                if not is_admin_booking:
                    return jsonify({'error': f'{file_field} fayli majburiy'}), 400
                uploaded_files[file_field] = None
                continue
            
            validation_result = validate_file(file, file_field)
            if not validation_result['valid']:
                return jsonify({'error': validation_result['error']}), 400
            
            uploaded_files[file_field] = file
        
        for file_field in optional_files:
            if file_field not in request.files:
                uploaded_files[file_field] = None
                continue
            
            file = request.files[file_field]
            if file.filename == '':
                uploaded_files[file_field] = None
                continue
            
            validation_result = validate_file(file, file_field)
            if not validation_result['valid']:
                uploaded_files[file_field] = None
                continue
            
            uploaded_files[file_field] = file
        
        # Generate booking ID
        booking_id = f"BK{datetime.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:4].upper()}"
        
        # Create booking
        booking = Booking(
            booking_id=booking_id,
            car_id=car_id,
            first_name=first_name_value,
            last_name=last_name_value,
            phone=phone_value,
            email=email_value,
            start_date=start_date,
            end_date=end_date,
            total_days=total_days,
            total_amount=total_amount,
            deposit_amount=deposit_amount
        )
        
        db.session.add(booking)
        db.session.commit()
        
        log_security_event('BOOKING_CREATED', f'Booking {booking_id} created', 'INFO')
        
        # Send Telegram notification
        try:
            send_telegram_notification(booking, car, uploaded_files)
        except Exception as e:
            log_security_event('TELEGRAM_NOTIFICATION_ERROR', str(e), 'WARNING')
        
        return jsonify({
            'success': True,
            'booking_id': booking_id,
            'message': 'Bron muvaffaqiyatli yaratildi'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        log_security_event('BOOKING_ERROR', str(e), 'ERROR')
        return jsonify({'error': str(e)}), 500

@bookings_bp.route('/<booking_id>', methods=['PUT'])
def update_booking(booking_id):
    """Update booking status"""
    try:
        booking = Booking.query.filter_by(booking_id=booking_id).first_or_404()
        data = request.get_json()
        
        # Update allowed fields
        if 'status' in data:
            old_status = booking.status
            new_status = data['status']
            booking.status = new_status
            
            # Send Telegram notification about status change
            try:
                from utils.telegram import send_booking_status_update
                send_booking_status_update(booking, booking.car, old_status, new_status)
            except Exception as e:
                print(f"Failed to send status update notification: {e}")
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Booking updated successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bookings_bp.route('/<booking_id>', methods=['DELETE'])
def delete_booking(booking_id):
    """Delete a booking"""
    try:
        booking = Booking.query.filter_by(booking_id=booking_id).first_or_404()
        
        db.session.delete(booking)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Booking deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bookings_bp.route('/stats', methods=['GET'])
def get_booking_stats():
    """Get booking statistics"""
    try:
        total_bookings = Booking.query.count()
        pending_bookings = Booking.query.filter_by(status='pending').count()
        confirmed_bookings = Booking.query.filter_by(status='confirmed').count()
        completed_bookings = Booking.query.filter_by(status='completed').count()
        cancelled_bookings = Booking.query.filter_by(status='cancelled').count()
        
        return jsonify({
            'total_bookings': total_bookings,
            'pending_bookings': pending_bookings,
            'confirmed_bookings': confirmed_bookings,
            'completed_bookings': completed_bookings,
            'cancelled_bookings': cancelled_bookings,
            'active_bookings': pending_bookings + confirmed_bookings
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bookings_bp.route('/<booking_id>/status', methods=['PUT'])
def update_booking_status(booking_id):
    """Update booking status (for Telegram bot)"""
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        # Validate status
        if new_status not in ['pending', 'confirmed', 'completed', 'cancelled']:
            return jsonify({'error': 'Noto\'g\'ri status'}), 400
        
        # Find booking
        booking = Booking.query.filter_by(booking_id=booking_id).first()
        if not booking:
            return jsonify({'error': 'Bron topilmadi'}), 404
        
        # Update status
        old_status = booking.status
        booking.status = new_status
        booking.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        print(f"✅ Booking {booking_id} status updated: {old_status} -> {new_status}")
        
        return jsonify({
            'success': True,
            'message': 'Status yangilandi',
            'booking_id': booking_id,
            'old_status': old_status,
            'new_status': new_status
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error updating booking status: {e}")
        return jsonify({'error': 'Xatolik yuz berdi'}), 500
