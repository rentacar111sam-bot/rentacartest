# APK Yuklab Olish Funksiyasi - To'liq Yo'riqnoma

## 1. APK Faylni Qayerga Joylashtirish

APK faylni **backend serveriga** joylashtiring:

```
rent car/
  └── apk/
      └── rentcar.apk  ← Bu yerga
```

## 2. APK Faylni Yaratish

### Variant A: Android Studio orqali

1. Android loyihangizni Android Studio'da oching
2. `Build` > `Build Bundle(s) / APK(s)` > `Build APK(s)`
3. Build tugagach, `locate` tugmasini bosing
4. `app-release.apk` faylini toping
5. Uni `rentcar.apk` deb nomlang
6. `apk/` papkaga ko'chiring

### Variant B: Capacitor orqali (Next.js uchun)

```bash
# Frontend papkasida
cd frontend

# Build qilish
npm run build

# Android sync
npx cap sync android

# Android Studio'ni ochish
npx cap open android

# Android Studio'da:
# Build > Build Bundle(s) / APK(s) > Build APK(s)
```

Tayyor APK faylni `apk/rentcar.apk` ga joylashtiring.

## 3. Serverni Qayta Ishga Tushirish

APK faylni joylashtirganingizdan keyin:

```bash
# Backend serverni to'xtatib, qayta ishga tushiring
python start.py
```

## 4. Test Qilish

### APK mavjudligini tekshirish:

Browser'da oching:
```
http://localhost:5000/api/apk/info
```

Natija:
```json
{
  "exists": true,
  "size": 25000000,
  "size_mb": 23.84,
  "filename": "rentcar.apk",
  "download_url": "/api/apk/download"
}
```

### APK yuklab olishni test qilish:

Browser'da oching:
```
http://localhost:5000/api/apk/download
```

Fayl yuklab olinishi kerak.

## 5. Frontend'dan Test Qilish

1. Frontend'ni ishga tushiring: `npm run dev`
2. Saytga kiring: `http://localhost:3000`
3. O'ng pastdagi yashil "APK Yuklab Olish" tugmasini bosing
4. Modal oynada "APK Faylni Yuklab Olish" tugmasini bosing
5. Fayl yuklab olinishi kerak

## 6. Platformalar Bo'yicha Ishlash

### Android:
- ✅ To'g'ridan-to'g'ri yuklab olib, o'rnatish mumkin
- "Noma'lum manbalar" ruxsatini yoqish kerak

### iOS (iPhone):
- ⚠️ APK ishlamaydi (faqat Android uchun)
- Faylni yuklab olib, Android qurilmaga o'tkazish kerak

### Desktop (Kompyuter):
- 💻 Faylni yuklab olib, Android qurilmaga o'tkazish kerak
- USB, Bluetooth, yoki cloud orqali

## 7. Production Deploy

### Netlify/Vercel:
APK faylni Git'ga qo'shmang (katta hajm). Deploy qilishdan oldin:

1. Server'ga SSH orqali kiring
2. APK faylni to'g'ridan-to'g'ri server'ga yuklang
3. `apk/` papkaga joylashtiring

### VPS/Dedicated Server:
```bash
# SCP orqali yuklash
scp rentcar.apk user@server:/path/to/project/apk/

# Yoki SFTP orqali
```

## 8. Xavfsizlik

### HTTPS:
Production'da HTTPS ishlatilsin:
```typescript
link.href = 'https://api.rentcar.uz/api/apk/download'
```

### Fayl Hajmi:
- Tavsiya: 50 MB dan kam
- Agar katta bo'lsa, CDN ishlatish yaxshiroq

### CDN (Tavsiya):
Katta APK fayllar uchun:

```python
# routes/apk.py
@apk_bp.route('/download', methods=['GET'])
def download_apk():
    # CDN'ga redirect
    return redirect('https://cdn.rentcar.uz/apk/rentcar.apk')
```

## 9. Versiyalash

Har safar yangi versiya chiqarganda:

1. APK faylni yangilang
2. `APKDownload.tsx` da versiya raqamini yangilang:

```typescript
<span className="font-semibold text-white">1.0.1</span>  // Bu yerda
```

3. Fayl hajmini yangilang (agar o'zgargan bo'lsa)

## 10. Muammo Yechish

### 404 Error:
```bash
# Fayl mavjudligini tekshiring
ls -lh apk/rentcar.apk

# Fayl ruxsatlarini tekshiring
chmod 644 apk/rentcar.apk
```

### Download boshlanmaydi:
- Browser console'ni tekshiring (F12)
- Network tab'da request'ni ko'ring
- CORS muammosi bo'lishi mumkin

### Fayl buzilgan:
- APK faylni qayta build qiling
- Fayl hajmini tekshiring
- MD5/SHA256 hash tekshiring

## 11. .gitignore

APK fayllarni Git'ga qo'shmang:

```gitignore
# APK files
apk/*.apk
!apk/README.md
```

## 12. Qo'shimcha

### APK Signing:
Production uchun APK'ni sign qiling:

```bash
# Android Studio'da:
# Build > Generate Signed Bundle / APK
```

### App Bundle:
Google Play uchun AAB format ishlatish yaxshiroq:

```bash
# Build > Build Bundle(s) / APK(s) > Build Bundle(s)
```

## Xulosa

APK yuklab olish funksiyasi tayyor! Faqat:

1. ✅ APK faylni `apk/rentcar.apk` ga joylashtiring
2. ✅ Serverni qayta ishga tushiring
3. ✅ Test qiling

Savollar bo'lsa, README.md faylini o'qing yoki admin bilan bog'laning.
