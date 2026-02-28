#!/usr/bin/env python3
import os
import requests
import time
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
ADMIN_CHAT_ID = os.getenv('TELEGRAM_ADMIN_CHAT_ID')

# Admin list file
ADMINS_FILE = 'admins.json'

if not BOT_TOKEN:
    print("❌ TELEGRAM_BOT_TOKEN not found in .env file")
    exit(1)

print(f"🤖 Starting Telegram bot...")
print(f"📱 Bot Token: {BOT_TOKEN[:20]}...")

def load_admins():
    """Load admin list from file"""
    if os.path.exists(ADMINS_FILE):
        try:
            with open(ADMINS_FILE, 'r') as f:
                return json.load(f)
        except:
            pass
    # Default admin
    return [int(ADMIN_CHAT_ID)] if ADMIN_CHAT_ID else []

def save_admins(admins):
    """Save admin list to file"""
    with open(ADMINS_FILE, 'w') as f:
        json.dump(admins, f)

def is_admin(chat_id):
    """Check if user is admin"""
    admins = load_admins()
    return int(chat_id) in admins

def add_admin(chat_id):
    """Add new admin"""
    admins = load_admins()
    if int(chat_id) not in admins:
        admins.append(int(chat_id))
        save_admins(admins)
        return True
    return False

def send_message(chat_id, text, parse_mode='Markdown', reply_markup=None):
    """Send message to Telegram chat"""
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    data = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': parse_mode
    }
    
    if reply_markup:
        data['reply_markup'] = json.dumps(reply_markup)
    
    try:
        response = requests.post(url, data=data, timeout=10)
        return response.json()
    except Exception as e:
        print(f"❌ Error sending message: {e}")
        return None

def answer_callback_query(callback_query_id, text=None):
    """Answer callback query"""
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/answerCallbackQuery"
    data = {'callback_query_id': callback_query_id}
    if text:
        data['text'] = text
    
    try:
        response = requests.post(url, data=data, timeout=10)
        return response.json()
    except Exception as e:
        print(f"❌ Error answering callback: {e}")
        return None

def edit_message_text(chat_id, message_id, text, parse_mode='Markdown'):
    """Edit message text"""
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/editMessageText"
    data = {
        'chat_id': chat_id,
        'message_id': message_id,
        'text': text,
        'parse_mode': parse_mode
    }
    
    try:
        response = requests.post(url, data=data, timeout=10)
        return response.json()
    except Exception as e:
        print(f"❌ Error editing message: {e}")
        return None

def update_booking_status(booking_id, status):
    """Update booking status via API"""
    try:
        url = f"http://localhost:5000/api/bookings/{booking_id}/status"
        data = {'status': status}
        response = requests.put(url, json=data, timeout=10)
        return response.json()
    except Exception as e:
        print(f"❌ Error updating booking: {e}")
        return None

def get_updates(offset=None):
    """Get updates from Telegram"""
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates"
    params = {'timeout': 30}
    if offset:
        params['offset'] = offset
    
    try:
        response = requests.get(url, params=params, timeout=35)
        return response.json()
    except Exception as e:
        print(f"❌ Error getting updates: {e}")
        return None

def handle_callback_query(callback_query):
    """Handle callback query (button press)"""
    query_id = callback_query['id']
    chat_id = callback_query['message']['chat']['id']
    message_id = callback_query['message']['message_id']
    data = callback_query['data']
    user = callback_query['from']
    
    print(f"🔘 Callback from {user.get('first_name')}: {data}")
    
    # Check if user is admin
    if not is_admin(chat_id):
        answer_callback_query(query_id, "❌ Sizda admin huquqi yo'q")
        return
    
    # Parse callback data: action_bookingid
    try:
        action, booking_id = data.split('_')
        
        if action == 'confirm':
            # Confirm booking
            result = update_booking_status(booking_id, 'confirmed')
            if result and result.get('success'):
                new_text = callback_query['message']['text'] + "\n\n✅ *TASDIQLANDI*"
                edit_message_text(chat_id, message_id, new_text)
                answer_callback_query(query_id, "✅ Bron tasdiqlandi!")
            else:
                answer_callback_query(query_id, "❌ Xatolik yuz berdi")
        
        elif action == 'cancel':
            # Cancel booking
            result = update_booking_status(booking_id, 'cancelled')
            if result and result.get('success'):
                new_text = callback_query['message']['text'] + "\n\n❌ *BEKOR QILINDI*"
                edit_message_text(chat_id, message_id, new_text)
                answer_callback_query(query_id, "❌ Bron bekor qilindi!")
            else:
                answer_callback_query(query_id, "❌ Xatolik yuz berdi")
    
    except Exception as e:
        print(f"❌ Error handling callback: {e}")
        answer_callback_query(query_id, "❌ Xatolik yuz berdi")

def handle_message(message):
    """Handle incoming message"""
    chat_id = message['chat']['id']
    text = message.get('text', '').strip()
    user = message['from']
    username = user.get('username', 'Unknown')
    first_name = user.get('first_name', 'User')
    
    print(f"📨 Message from @{username} ({first_name}): {text}")
    
    # Admin uchun maxsus xabar
    if '/start' in text or text.strip() == '/start':
        if is_admin(chat_id):
            welcome_text = f"""Assalomu aleykum Admin!

👨‍💼 *Admin Panel*

Siz admin sifatida quyidagi buyruqlardan foydalanishingiz mumkin:

📋 *Buyruqlar:*
/addadmin [chat_id] - Yangi admin qo'shish
/admins - Barcha adminlar ro'yxati
/help - Yordam

🌐 *Sayt:* [rentcarsamarkand.uz](http://rentcarsamarkand.uz/)
📱 *Instagram:* [Instagram](https://www.instagram.com/rentcar.samarkand)"""
        else:
            welcome_text = f"""Assalomu aleykum {first_name}!

Samarqand RentCar'ga xush kelibsiz!🚗

🚗 *Bizning xizmatlarimiz:*
• Avtomobil ijarasi
• Onlayn bron qilish
• 24/7 qo'llab-quvvatlash

🌐 *Saytimizga kiring:* [Sayt](http://rentcarsamarkand.uz/)

📱 *Instagram:* [Instagram](https://www.instagram.com/rentcar.samarkand?igsh=MWc4czNlYnFxbTdjMw==)

Savollaringiz bo'lsa, biz bilan bog'laning!
Admin: @rentcarsamarkand 😊"""
        
        send_message(chat_id, welcome_text)
        
        # Notify admins about new user (if not admin)
        if not is_admin(chat_id):
            admin_text = f"""👤 *Yangi foydalanuvchi botga start berdi:*

👤 Ism: {first_name}
🆔 Username: @{username}
💬 Chat ID: `{chat_id}`
📅 Vaqt: {time.strftime('%d.%m.%Y %H:%M')}"""
            
            admins = load_admins()
            for admin_id in admins:
                send_message(admin_id, admin_text)
    
    # Add admin command
    elif text.startswith('/addadmin'):
        if is_admin(chat_id):
            try:
                parts = text.split()
                if len(parts) == 2:
                    new_admin_id = int(parts[1])
                    if add_admin(new_admin_id):
                        send_message(chat_id, f"✅ Yangi admin qo'shildi: `{new_admin_id}`")
                        send_message(new_admin_id, "🎉 Siz admin sifatida qo'shildingiz!")
                    else:
                        send_message(chat_id, "⚠️ Bu foydalanuvchi allaqachon admin")
                else:
                    send_message(chat_id, "❌ Noto'g'ri format. Misol: /addadmin 123456789")
            except ValueError:
                send_message(chat_id, "❌ Chat ID raqam bo'lishi kerak")
        else:
            send_message(chat_id, "❌ Sizda admin huquqi yo'q")
    
    # List admins command
    elif text == '/admins':
        if is_admin(chat_id):
            admins = load_admins()
            admin_list = "\n".join([f"• `{admin_id}`" for admin_id in admins])
            send_message(chat_id, f"👨‍💼 *Adminlar ro'yxati:*\n\n{admin_list}")
        else:
            send_message(chat_id, "❌ Sizda admin huquqi yo'q")
    
    # Help command
    elif text == '/help':
        if is_admin(chat_id):
            help_text = """📋 *Admin buyruqlari:*

/addadmin [chat_id] - Yangi admin qo'shish
/admins - Barcha adminlar ro'yxati
/help - Bu yordam xabari

💡 *Maslahat:*
Yangi admin qo'shish uchun, avval foydalanuvchi botga /start yuborishi kerak, keyin siz uning chat ID sini ko'rib /addadmin buyrug'i bilan qo'shasiz."""
            send_message(chat_id, help_text)
        else:
            send_message(chat_id, "📋 Yordam uchun @rentcarsamarkand ga murojaat qiling")
    
    # Boshqa xabarlarga javob berma
    else:
        print(f"⏭️  Xabar e'tiborga olinmadi: {text}")

def main():
    """Main bot loop"""
    print("✅ Bot ishga tushdi!")
    print("📱 /start buyrug'ini yuboring")
    print("⏹️  To'xtatish uchun Ctrl+C bosing")
    
    offset = None
    
    try:
        while True:
            updates = get_updates(offset)
            
            if updates and updates.get('ok'):
                for update in updates.get('result', []):
                    if 'message' in update:
                        handle_message(update['message'])
                    elif 'callback_query' in update:
                        handle_callback_query(update['callback_query'])
                    
                    # Update offset
                    offset = update['update_id'] + 1
            
            time.sleep(1)
    
    except KeyboardInterrupt:
        print("\n🛑 Bot to'xtatildi")
    except Exception as e:
        print(f"❌ Bot xatosi: {e}")

if __name__ == "__main__":
    main()