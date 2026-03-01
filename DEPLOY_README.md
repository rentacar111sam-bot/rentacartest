# 🚀 RentCar - VPS Deploy Yo'riqnomalari

Bu papkada VPS serverga deploy qilish uchun barcha kerakli fayllar va yo'riqnomalar mavjud.

## 📚 Yo'riqnomalar

### 1. **DEPLOY_QUICK.md** - Tezkor Deploy (5 daqiqa)
Eng tez va oson usul. Avtomatik skript bilan deploy qilish.

**Kimlar uchun:** Yangi boshlovchilar, tez deploy qilmoqchi bo'lganlar

**Qadamlar:**
1. Fayllarni serverga yuklash
2. `deploy.sh` skriptini ishga tushirish
3. Domenni kiritish
4. Tayyor!

### 2. **VPS_DEPLOYMENT_GUIDE.md** - To'liq Yo'riqnoma
Batafsil, qadamma-qadam yo'riqnoma.

**Kimlar uchun:** Har bir qadamni tushunmoqchi bo'lganlar, qo'lda sozlamoqchi bo'lganlar

**Qamrab oladi:**
- Sistema tayyorlash
- Backend sozlash
- Frontend build qilish
- Nginx konfiguratsiyasi
- SSL sertifikat
- Xavfsizlik sozlamalari

### 3. **DEPLOY_CHECKLIST.md** - Tekshirish Ro'yxati
Deploy qilishdan oldin va keyin tekshirish kerak bo'lgan narsalar.

**Kimlar uchun:** Hamma uchun (deploy qilishdan oldin o'qing!)

**Qamrab oladi:**
- Pre-deploy tekshirish
- Kerakli fayllar ro'yxati
- Post-deploy tekshirish
- Xavfsizlik tekshiruvi
- Monitoring

---

## 📁 Deploy Fayllari

### Skriptlar
- **deploy.sh** - Avtomatik deploy skripti (Linux/Ubuntu)
- **update.sh** - Loyihani yangilash skripti

### Konfiguratsiya Fayllari
- **nginx.conf** - Nginx server konfiguratsiyasi
- **systemd-backend.service** - Backend systemd service
- **systemd-frontend.service** - Frontend systemd service
- **.env.production** - Backend production sozlamalari (namuna)
- **frontend/.env.production** - Frontend production sozlamalari (namuna)

---

## 🎯 Qaysi Yo'riqnomani Tanlash?

### Agar siz...

**...yangi boshlovchi bo'lsangiz:**
→ `DEPLOY_QUICK.md` ni o'qing va `deploy.sh` skriptini ishlating

**...har bir qadamni tushunmoqchi bo'lsangiz:**
→ `VPS_DEPLOYMENT_GUIDE.md` ni o'qing va qo'lda deploy qiling

**...deploy qilishdan oldin tayyorgarlik ko'rmoqchi bo'lsangiz:**
→ `DEPLOY_CHECKLIST.md` ni o'qing va tekshiring

**...muammoga duch kelsangiz:**
→ `TROUBLESHOOTING.md` ni o'qing

---

## ⚡ Tezkor Boshlash (3 Qadam)

### 1. Tayyorgarlik
```bash
# .env.production faylini tahrirlash
nano .env.production

# O'zgartirish kerak:
# - SECRET_KEY
# - JWT_SECRET_KEY
# - ADMIN_PASSWORD
# - your-domain.com → o'z domeningiz
```

### 2. Serverga Yuklash
```bash
# Lokal kompyuterdan
scp -r /path/to/rentcar root@your_server_ip:/root/
```

### 3. Deploy Qilish
```bash
# Serverda
cd /root/rentcar
chmod +x deploy.sh
./deploy.sh
```

**Tayyor!** 🎉

---

## 📋 Minimal Talablar

### VPS Server
- **OS:** Ubuntu 20.04+
- **RAM:** 2GB minimum (4GB tavsiya etiladi)
- **Disk:** 20GB minimum
- **CPU:** 1 core minimum (2 core tavsiya etiladi)

### Domen
- Domen nomi (masalan: rentcar.uz)
- DNS sozlamalari:
  - `your-domain.com` → server IP
  - `www.your-domain.com` → server IP
  - `api.your-domain.com` → server IP

### Ma'lumotlar Bazasi
- PostgreSQL (Supabase yoki boshqa)
- Database URL

---

## 🔧 Texnologiyalar

### Backend
- Python 3.8+
- Flask
- Gunicorn (production server)
- PostgreSQL

### Frontend
- Node.js 18+
- Next.js 14
- TypeScript
- Tailwind CSS

### Server
- Ubuntu 20.04+
- Nginx (reverse proxy)
- Systemd (process manager)
- Let's Encrypt (SSL)

---

## 📞 Yordam

### Yo'riqnomalar
1. `DEPLOY_QUICK.md` - Tezkor deploy
2. `VPS_DEPLOYMENT_GUIDE.md` - To'liq yo'riqnoma
3. `DEPLOY_CHECKLIST.md` - Tekshirish ro'yxati
4. `TROUBLESHOOTING.md` - Muammolarni hal qilish

### Foydali Buyruqlar
```bash
# Services statusini tekshirish
sudo systemctl status rentcar-backend rentcar-frontend

# Loglarni ko'rish
sudo journalctl -u rentcar-backend -f
sudo journalctl -u rentcar-frontend -f

# Loyihani yangilash
cd /var/www/rentcar && ./update.sh
```

---

## ✅ Deploy Muvaffaqiyatli Bo'lgandan Keyin

1. ✅ Frontend ochiladi: `https://your-domain.com`
2. ✅ Backend API ishlaydi: `https://api.your-domain.com/api/health`
3. ✅ Admin panel kirish mumkin: `https://your-domain.com/admin`
4. ✅ SSL sertifikat o'rnatilgan (HTTPS)
5. ✅ Telegram bot xabarlar yuboradi
6. ✅ Rasm yuklash ishlaydi

---

## 🔒 Xavfsizlik

Deploy qilgandan keyin:
1. ✅ `.env` faylidagi parollarni o'zgartiring
2. ✅ SSH port raqamini o'zgartiring
3. ✅ SSH parol autentifikatsiyasini o'chiring
4. ✅ Firewall sozlang
5. ✅ Muntazam backup oling

---

## 🎉 Muvaffaqiyatli Deploy!

Agar hamma narsa to'g'ri bo'lsa, loyihangiz endi jonli va internetda ishlayapti!

**Keyingi qadamlar:**
- Admin panelga kiring
- Mashinalar qo'shing
- Sozlamalarni tekshiring
- Telegram bot ishlashini tekshiring
- Bron qilish jarayonini test qiling

---

**Omad! 🚀**
