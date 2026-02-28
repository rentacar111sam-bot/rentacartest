# Telegram Bot Setup Guide

## Admin Bot Commands

Telegram bot orqali admin panelni boshqarish uchun quyidagi buyruqlardan foydalaning:

### Buyruqlar:

1. **/start** - Bosh menyu
2. **/bookings** - Barcha bronlarni ko'rish (oxirgi 10 ta)
3. **/pending** - Kutilayotgan bronlarni ko'rish
4. **/confirmed** - Tasdiqlangan bronlarni ko'rish
5. **/stats** - Statistika ko'rish
6. **/help** - Yordam

## Webhook Setup

Telegram bot webhook-ni setup qilish uchun:

```bash
curl -X POST https://api.telegram.org/bot{BOT_TOKEN}/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://yourdomain.com/api/telegram/webhook"}'
```

## Environment Variables

`.env` faylida quyidagi o'zgaruvchilarni o'rnatish kerak:

```
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
TELEGRAM_ADMIN_CHAT_ID=your_admin_chat_id_here
```

## Bot Features

### Avtomatik Xabari

Yangi bron yaratilganda, Telegram bot avtomatik ravishda admin-ga xabar yuboradi:
- Bron ID
- Mijoz ma'lumotlari
- Avtomobil nomi
- Bron sanasi
- Jami summa
- Zalog miqdori
- Hujjatlar (pasport, haydovchilik guvohnomasi, to'lov cheki)

### Admin Commands

Admin Telegram bot-ga buyruq yuborishi mumkin:
- Barcha bronlarni ko'rish
- Status bo'yicha filtrlash
- Statistika ko'rish
- Avtomobillar haqida ma'lumot olish

## Telegram Bot Token Olish

1. Telegram-da @BotFather-ga yozing
2. `/newbot` buyruqini yuboring
3. Bot nomi va username-ni kiriting
4. Bot token-ni oling
5. `.env` faylida `TELEGRAM_BOT_TOKEN` o'zgaruvchisiga qo'ying

## Chat ID Olish

1. Bot-ga `/start` yuboring
2. Webhook-dan chat ID-ni oling yoki
3. @userinfobot-dan chat ID-ni oling
4. `.env` faylida `TELEGRAM_ADMIN_CHAT_ID` o'zgaruvchisiga qo'ying
