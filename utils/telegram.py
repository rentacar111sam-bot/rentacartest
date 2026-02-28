import requests
import os
import json
from flask import current_app

def send_telegram_notification(booking, car, uploaded_files=None):
    """Send booking notification to Telegram with documents and action buttons"""
    try:
        bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        chat_id = os.getenv('TELEGRAM_ADMIN_CHAT_ID')
        
        if not bot_token or not chat_id:
            print("Telegram bot token or admin chat ID not configured - skipping notification")
            return False
        
        # Prepare message
        message = f"""🚗 *YANGI BRON KELDI!*

📋 *Bron ID:* `{booking.booking_id}`
👤 *Mijoz:* {booking.first_name} {booking.last_name}
📞 *Telefon:* `{booking.phone}`
📧 *Email:* {booking.email or 'Yo\'q'}

🚙 *Avtomobil:* {car.name}
📅 *Sana:* {booking.start_date.strftime('%d.%m.%Y')} - {booking.end_date.strftime('%d.%m.%Y')}
⏰ *Kunlar:* {booking.total_days} kun
💰 *Umumiy summa:* {booking.total_amount:,.0f} so'm
💳 *Zalog (60%):* {booking.deposit_amount:,.0f} so'm

📄 *Hujjatlar yuklandi:*
✅ Pasport (old/orqa)
✅ To'lov cheki

⚡ *Bronni tasdiqlang yoki bekor qiling:*"""
        
        # Inline keyboard with action buttons
        reply_markup = {
            'inline_keyboard': [
                [
                    {'text': '✅ Tasdiqlash', 'callback_data': f'confirm_{booking.booking_id}'},
                    {'text': '❌ Bekor qilish', 'callback_data': f'cancel_{booking.booking_id}'}
                ]
            ]
        }
        
        # Send message with buttons
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        data = {
            'chat_id': chat_id,
            'text': message,
            'parse_mode': 'Markdown',
            'reply_markup': json.dumps(reply_markup)
        }
        
        response = requests.post(url, json=data, timeout=10)
        
        if response.status_code == 200:
            print("Telegram notification sent successfully")
            # Send documents after main message
            if uploaded_files:
                send_booking_documents_from_files(bot_token, chat_id, booking.booking_id, uploaded_files)
            return True
        else:
            print(f"Failed to send Telegram message: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error sending Telegram notification: {e}")
        return False

def send_booking_documents_from_files(bot_token, chat_id, booking_id, uploaded_files):
    """Send booking documents to Telegram from file objects"""
    try:
        documents = [
            ('📄 Pasport (old tomoni)', 'passportFront'),
            ('📄 Pasport (orqa tomoni)', 'passportBack'),
            ('💳 To\'lov cheki (60% zalog)', 'paymentReceipt'),
            ('🚗 Haydovchilik guvohnomasi', 'driverLicense')
        ]
        
        for title, file_key in documents:
            file_obj = uploaded_files.get(file_key)
            if file_obj:
                send_document_to_telegram_from_file(bot_token, chat_id, file_obj, f"{title} - {booking_id}")
                    
    except Exception as e:
        print(f"Error sending documents to Telegram: {e}")

def send_document_to_telegram_from_file(bot_token, chat_id, file_obj, caption):
    """Send a single document to Telegram from file object"""
    try:
        url = f"https://api.telegram.org/bot{bot_token}/sendDocument"
        
        # Reset file pointer to beginning
        file_obj.seek(0)
        
        files = {'document': (file_obj.filename, file_obj, file_obj.content_type)}
        data = {
            'chat_id': chat_id,
            'caption': caption
        }
        
        response = requests.post(url, files=files, data=data, timeout=30)
        
        if response.status_code == 200:
            print(f"Document sent successfully: {caption}")
        else:
            print(f"Failed to send document {caption}: {response.text}")
                
    except Exception as e:
        print(f"Error sending document {caption}: {e}")

def send_booking_status_update(booking, car, old_status, new_status):
    """Send booking status update to Telegram"""
    try:
        bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        chat_id = os.getenv('TELEGRAM_ADMIN_CHAT_ID')
        
        if not bot_token or not chat_id:
            return False
        
        status_emojis = {
            'pending': '⏳',
            'confirmed': '✅',
            'completed': '🏁',
            'cancelled': '❌'
        }
        
        status_names = {
            'pending': 'Kutilmoqda',
            'confirmed': 'Tasdiqlandi',
            'completed': 'Yakunlandi',
            'cancelled': 'Bekor qilindi'
        }
        
        message = f"""📊 *BRON HOLATI O'ZGARTIRILDI*

📋 *Bron ID:* `{booking.booking_id}`
👤 *Mijoz:* {booking.first_name} {booking.last_name}
🚙 *Avtomobil:* {car.name}

{status_emojis.get(old_status, '❓')} *Eski holat:* {status_names.get(old_status, old_status)}
{status_emojis.get(new_status, '❓')} *Yangi holat:* {status_names.get(new_status, new_status)}

📅 *Sana:* {booking.start_date.strftime('%d.%m.%Y')} - {booking.end_date.strftime('%d.%m.%Y')}"""
        
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        data = {
            'chat_id': chat_id,
            'text': message,
            'parse_mode': 'Markdown'
        }
        
        response = requests.post(url, data=data, timeout=10)
        return response.status_code == 200
        
    except Exception as e:
        print(f"Error sending status update: {e}")
        return False

def send_test_message():
    """Send a test message to verify Telegram configuration"""
    try:
        bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        chat_id = os.getenv('TELEGRAM_ADMIN_CHAT_ID')
        
        if not bot_token:
            return {'success': False, 'error': 'Bot token not configured'}
        if not chat_id:
            return {'success': False, 'error': 'Admin chat ID not configured'}
        
        message = """🧪 *TEST XABARI*

✅ RentCar Telegram bot ishlayapti!
🚗 Yangi bronlar uchun xabarlar keladi
📊 Admin panel bilan bog'langan

*Bot sozlamalari:*
• Token: ✅ Sozlangan
• Chat ID: ✅ Sozlangan
• Xabarlar: ✅ Ishlaydi"""
        
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        data = {
            'chat_id': chat_id,
            'text': message,
            'parse_mode': 'Markdown'
        }
        
        print(f"Sending to URL: {url}")
        print(f"Chat ID: {chat_id}")
        
        response = requests.post(url, data=data, timeout=10)
        
        print(f"Response status: {response.status_code}")
        print(f"Response text: {response.text}")
        
        if response.status_code == 200:
            return {'success': True, 'message': 'Test message sent successfully', 'response': response.json()}
        else:
            return {'success': False, 'error': f'Failed to send message: {response.text}', 'status_code': response.status_code}
            
    except Exception as e:
        print(f"Exception: {str(e)}")
        return {'success': False, 'error': str(e)}


def send_contact_notification(contact):
    """Send contact message notification to Telegram"""
    try:
        bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        chat_id = os.getenv('TELEGRAM_ADMIN_CHAT_ID')
        
        if not bot_token:
            print("Telegram bot token not configured - skipping notification")
            return False
        
        if not chat_id:
            print("Telegram admin chat ID not configured - skipping notification")
            return False
        
        # Prepare message
        message = f"""📨 *YANGI XABAR KELDI!*

👤 *Ism:* {contact.name}
📞 *Telefon:* `{contact.phone}`

📋 *Mavzu:* {contact.subject}

💬 *Xabar:*
{contact.message}

📅 *Sana:* {contact.created_at.strftime('%d.%m.%Y %H:%M')}

⚡ *Admin panelda javob bering*"""
        
        # Send message
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        data = {
            'chat_id': chat_id,
            'text': message,
            'parse_mode': 'Markdown'
        }
        
        response = requests.post(url, data=data, timeout=10)
        
        if response.status_code == 200:
            print("Contact notification sent successfully to Telegram")
            return True
        else:
            print(f"Failed to send contact notification: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error sending contact notification: {e}")
        return False
