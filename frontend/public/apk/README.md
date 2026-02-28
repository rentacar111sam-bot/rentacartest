# APK Fayl Joylash Bo'yicha Yo'riqnoma

## 1. APK Faylni Yaratish

### Android Studio yordamida:
1. Android Studio'da loyihani oching
2. `Build` > `Build Bundle(s) / APK(s)` > `Build APK(s)`
3. Build tugagach, `locate` tugmasini bosing
4. `app-release.apk` faylini toping

### Capacitor yordamida (Next.js uchun):
```bash
# Frontend papkasida
cd frontend

# Android build
npm run build
npx cap sync android
npx cap open android

# Android Studio'da:
# Build > Build Bundle(s) / APK(s) > Build APK(s)
```

## 2. APK Faylni Nomlash

APK faylni `rentcar.apk` deb nomlang yoki `APKDownload.tsx` faylidagi quyidagi qatorni o'zgartiring:

```typescript
link.href = '/apk/rentcar.apk'  // Bu yerda fayl nomini o'zgartiring
```

## 3. APK Faylni Joylashtirish

APK faylni quyidagi papkaga joylashtiring:
```
frontend/public/apk/rentcar.apk
```

Yoki:
```
frontend/public/apk/RentCar-v1.0.0.apk
```

## 4. Fayl Hajmini Tekshirish

APK fayl hajmi odatda:
- Minimal: 5-10 MB
- O'rtacha: 15-30 MB
- Katta: 30-50 MB

Agar fayl 50 MB dan katta bo'lsa, Google Drive yoki boshqa cloud storage'dan link bering.

## 5. Versiyalash

Har safar yangi versiya chiqarganda:
```
rentcar-v1.0.0.apk
rentcar-v1.0.1.apk
rentcar-v1.1.0.apk
```

Va `APKDownload.tsx` faylidagi versiya raqamini yangilang:
```typescript
<span className="font-semibold text-white">1.0.0</span>  // Bu yerda
```

## 6. Git Ignore

APK fayllar katta bo'lgani uchun, `.gitignore` fayliga qo'shing:
```
# APK files
frontend/public/apk/*.apk
```

## 7. Production Deploy

### Netlify/Vercel:
APK faylni deploy qilishdan oldin yuklang, chunki Git'da ignore qilingan.

### Manual Upload:
1. Build qiling: `npm run build`
2. APK faylni `out/apk/` papkaga nusxalang
3. Deploy qiling

## 8. CDN (Tavsiya etiladi)

Katta APK fayllar uchun CDN ishlatish yaxshiroq:

### Cloudflare R2 / AWS S3:
```typescript
link.href = 'https://cdn.rentcar.uz/apk/rentcar.apk'
```

### Google Drive:
1. APK faylni Google Drive'ga yuklang
2. "Anyone with the link" ruxsatini bering
3. Direct download link oling

## 9. Xavfsizlik

APK faylni himoyalash uchun:
- HTTPS ishlatilsin
- Fayl hash (SHA-256) tekshirish
- Digital signature

## 10. Test Qilish

APK yuklab olishni test qiling:
1. Android telefondan saytga kiring
2. APK tugmasini bosing
3. Faylni yuklab oling
4. O'rnatib ko'ring

## Muammo Yechish

### 404 Error:
- Fayl to'g'ri papkada ekanligini tekshiring
- Fayl nomi to'g'ri yozilganligini tekshiring
- Server restart qiling

### Download boshlanmaydi:
- Browser console'ni tekshiring
- Network tab'da request'ni ko'ring
- CORS muammosi bo'lishi mumkin

### Fayl buzilgan:
- APK faylni qayta build qiling
- Fayl hajmini tekshiring
- Transfer paytida xatolik bo'lmagan bo'lsin

## Qo'shimcha

APK faylni joylashtirganingizdan keyin, quyidagi URL orqali tekshiring:
```
https://yoursite.com/apk/rentcar.apk
```

Yoki local:
```
http://localhost:3000/apk/rentcar.apk
```
