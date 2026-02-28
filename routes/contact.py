from flask import Blueprint, request, jsonify
from models import db, ContactMessage
from datetime import datetime
from utils.telegram import send_contact_notification

contact_bp = Blueprint('contact', __name__)

@contact_bp.route('/info', methods=['GET'])
def get_contact_info():
    """Get contact information from settings"""
    try:
        from models import Settings
        
        phone = Settings.query.filter_by(key='contact_phone').first()
        email = Settings.query.filter_by(key='contact_email').first()
        address = Settings.query.filter_by(key='contact_address').first()
        
        return jsonify({
            'success': True,
            'phone': phone.value if phone else '+998 90 123 45 67',
            'email': email.value if email else 'info@rentcar.uz',
            'address': address.value if address else 'Toshkent shahar, Chilonzor tumani'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@contact_bp.route('/', methods=['POST'])
@contact_bp.route('', methods=['POST'])
def create_contact():
    """Create a new contact message"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'phone', 'email', 'subject', 'message']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create contact message
        contact = ContactMessage(
            name=data['name'],
            phone=data['phone'],
            email=data['email'],
            subject=data['subject'],
            message=data['message']
        )
        
        db.session.add(contact)
        db.session.commit()
        
        # Send Telegram notification to admin
        try:
            send_contact_notification(contact)
        except Exception as e:
            print(f"Failed to send Telegram notification: {e}")
        
        return jsonify({
            'success': True,
            'message': 'Xabar muvaffaqiyatli yuborildi',
            'contact': {
                'id': contact.id,
                'name': contact.name,
                'phone': contact.phone,
                'email': contact.email,
                'subject': contact.subject,
                'message': contact.message,
                'created_at': contact.created_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@contact_bp.route('/', methods=['GET'])
def get_contacts():
    """Get all contact messages (admin only)"""
    try:
        contacts = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'contacts': [{
                'id': contact.id,
                'name': contact.name,
                'phone': contact.phone,
                'email': contact.email,
                'subject': contact.subject,
                'message': contact.message,
                'created_at': contact.created_at.isoformat()
            } for contact in contacts]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@contact_bp.route('/<int:contact_id>', methods=['DELETE'])
def delete_contact(contact_id):
    """Delete a contact message (admin only)"""
    try:
        contact = ContactMessage.query.get(contact_id)
        
        if not contact:
            return jsonify({'error': 'Contact message not found'}), 404
        
        db.session.delete(contact)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Contact message deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
