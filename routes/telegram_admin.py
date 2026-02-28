from flask import Blueprint, request, jsonify
from models import Booking, Car, db
import os
import requests
from datetime import datetime

telegram_admin_bp = Blueprint('telegram_admin', __name__)

TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
TELEGRAM_ADMIN_CHAT_ID = os.getenv('TELEGRAM_ADMIN_CHAT_ID')

def send_telegram_message(chat_id, text, parse_mode='Markdown'):
    """Send message to Telegram"""
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        data = {
            'chat_id': chat_id,
            'text': text,
            'parse_mode': parse_mode
        }
        response = requests.post(url, data=data, timeout=10)
        return response.status_code == 200
    except Exception as e:
        print(f"Error sending Telegram message: {e}")
        return False

def send_telegram_keyboard(chat_id, text, buttons):
    """Send message with inline keyboard"""
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        data = {
            'chat_id': chat_id,
            'text': text,
            'parse_mode': 'Markdown',
            'reply_markup': {
                'inline_keyboard': buttons
            }
        }
        response = requests.post(url, json=data, timeout=10)
        return response.status_code == 200
    except Exception as e:
        print(f"Error sending Telegram keyboard: {e}")
        return False

@telegram_admin_bp.route('/webhook', methods=['POST'])
def telegram_webhook():
    """Handle Telegram webhook"""
    try:
        data = request.get_json()
        
        if 'message' in data:
            message = data['message']
            chat_id = message['chat']['id']
            text = message.get('text', '')
            
            # Admin commands
            if text == '/start':
                send_telegram_message(chat_id, 
                    "🚗 *RentCar Admin Bot*\n\n"
                    "Quyidagi buyruqlardan foydalaning:\n"
                    "/bookings - Barcha bronlarni ko'rish\n"
                    "/pending - Kutilayotgan bronlar\n"
                    "/confirmed - Tasdiqlangan bronlar\n"
                    "/stats - Statistika\n"
                    "/help - Yordam")
            
            elif text == '/bookings':
                show_bookings(chat_id)
            
            elif text == '/pending':
                show_bookings_by_status(chat_id, 'pending')
            
            elif text == '/confirmed':
                show_bookings_by_status(chat_id, 'confirmed')
            
            elif text == '/stats':
                show_stats(chat_id)
            
            elif text == '/help':
                send_telegram_message(chat_id,
                    "📖 *Yordam*\n\n"
                    "/bookings - Barcha bronlarni ko'rish\n"
                    "/pending - Kutilayotgan bronlar\n"
                    "/confirmed - Tasdiqlangan bronlar\n"
                    "/stats - Statistika\n"
                    "/start - Bosh menyu")
            
            else:
                send_telegram_message(chat_id, "❌ Noma'lum buyruq. /help ni bosing.")
        
        return jsonify({'ok': True})
    
    except Exception as e:
        print(f"Error in telegram webhook: {e}")
        return jsonify({'ok': False, 'error': str(e)}), 500

def show_bookings(chat_id):
    """Show all bookings"""
    try:
        bookings = Booking.query.order_by(Booking.created_at.desc()).limit(10).all()
        
        if not bookings:
            send_telegram_message(chat_id, "📭 Bronlar topilmadi")
            return
        
        message = "📋 *Oxirgi 10 ta bron:*\n\n"
        for booking in bookings:
            car = Car.query.get(booking.car_id)
            status_emoji = '⏳' if booking.status == 'pending' else '✅' if booking.status == 'confirmed' else '🏁' if booking.status == 'completed' else '❌'
            message += f"{status_emoji} *{booking.car_name}* - {booking.first_name} {booking.last_name}\n"
            message += f"📞 {booking.phone}\n"
            message += f"📅 {booking.start_date} - {booking.end_date} ({booking.total_days} kun)\n"
            message += f"💰 {booking.total_amount:,.0f} so'm\n\n"
        
        send_telegram_message(chat_id, message)
    
    except Exception as e:
        print(f"Error showing bookings: {e}")
        send_telegram_message(chat_id, f"❌ Xatolik: {str(e)}")

def show_bookings_by_status(chat_id, status):
    """Show bookings by status"""
    try:
        bookings = Booking.query.filter_by(status=status).order_by(Booking.created_at.desc()).limit(10).all()
        
        if not bookings:
            status_text = 'Kutilayotgan' if status == 'pending' else 'Tasdiqlangan' if status == 'confirmed' else status
            send_telegram_message(chat_id, f"📭 {status_text} bronlar topilmadi")
            return
        
        status_text = 'Kutilayotgan' if status == 'pending' else 'Tasdiqlangan' if status == 'confirmed' else status
        message = f"📋 *{status_text} bronlar ({len(bookings)} ta):*\n\n"
        
        for booking in bookings:
            message += f"🚙 *{booking.car_name}*\n"
            message += f"👤 {booking.first_name} {booking.last_name}\n"
            message += f"📞 {booking.phone}\n"
            message += f"📅 {booking.start_date} - {booking.end_date}\n"
            message += f"💰 {booking.total_amount:,.0f} so'm\n"
            message += f"ID: `{booking.booking_id}`\n\n"
        
        send_telegram_message(chat_id, message)
    
    except Exception as e:
        print(f"Error showing bookings by status: {e}")
        send_telegram_message(chat_id, f"❌ Xatolik: {str(e)}")

def show_stats(chat_id):
    """Show statistics"""
    try:
        total_bookings = Booking.query.count()
        pending = Booking.query.filter_by(status='pending').count()
        confirmed = Booking.query.filter_by(status='confirmed').count()
        completed = Booking.query.filter_by(status='completed').count()
        cancelled = Booking.query.filter_by(status='cancelled').count()
        
        total_cars = Car.query.count()
        available_cars = Car.query.filter_by(available=True).count()
        
        total_revenue = db.session.query(db.func.sum(Booking.total_amount)).filter(
            Booking.status.in_(['confirmed', 'completed'])
        ).scalar() or 0
        
        message = f"""📊 *Statistika*

*Bronlar:*
📋 Jami: {total_bookings}
⏳ Kutilmoqda: {pending}
✅ Tasdiqlandi: {confirmed}
🏁 Tugallandi: {completed}
❌ Bekor qilindi: {cancelled}

*Avtomobillar:*
🚗 Jami: {total_cars}
✅ Mavjud: {available_cars}
❌ Band: {total_cars - available_cars}

*Daromad:*
💰 Jami: {total_revenue:,.0f} so'm"""
        
        send_telegram_message(chat_id, message)
    
    except Exception as e:
        print(f"Error showing stats: {e}")
        send_telegram_message(chat_id, f"❌ Xatolik: {str(e)}")

@telegram_admin_bp.route('/send-notification', methods=['POST'])
def send_notification():
    """Send notification to admin"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        if send_telegram_message(TELEGRAM_ADMIN_CHAT_ID, message):
            return jsonify({'success': True, 'message': 'Notification sent'})
        else:
            return jsonify({'error': 'Failed to send notification'}), 500
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
