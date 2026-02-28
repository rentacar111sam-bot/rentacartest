# Telefondan Saytga Kirish

## 1. Kompyuter va Telefon Bir Wi-Fi'da Bo'lishi Kerak

Kompyuter va telefon **bir xil Wi-Fi tarmoqqa** ulangan bo'lishi shart!

## 2. Kompyuteringizning IP Manzili

Sizning kompyuteringizning IP manzili: **192.168.100.246**

## 3. Telefondan Kirish

### Frontend (Sayt):
Telefon browser'ida oching:
```
http://192.168.100.246:3000
```

### Backend (API):
```
http://192.168.100.246:5000
```

### APK Yuklab Olish:
```
http://192.168.100.246:5000/api/apk/download
```

## 4. Agar Ishlamasa

### A. Firewall'ni Tekshiring

Windows Firewall APK yuklab olishni bloklashi mumkin.

**Yechim 1: Firewall'da ruxsat berish**

1. Windows Search'da "Windows Defender Firewall" ni oching
2. "Allow an app through firewall" ni bosing
3. "Change settings" ni bosing
4. "Python" ni toping va Private/Public'ni belgilang
5. OK bosing

**Yechim 2: Firewall'ni vaqtincha o'chirish (test uchun)**

```powershell
# PowerShell'da (Admin sifatida)
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

# Qayta yoqish
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

### B. IP Manzilni Qayta Tekshirish

Agar IP o'zgargan bo'lsa:

```bash
ipconfig | findstr IPv4
```

Yangi IP manzilni APKDownload.tsx faylida yangilang.

### C. Backend Portini Tekshirish

Backend 0.0.0.0 da ishlayotganini tekshiring:

```python
# app.py oxirida
app.run(debug=False, host='0.0.0.0', port=5000)
```

## 5. Test Qilish

### Telefon Browser'da:

1. Chrome/Safari'ni oching
2. `http://192.168.100.246:3000` ga kiring
3. APK tugmasini bosing
4. Modal oynada "APK Faylni Yuklab Olish" ni bosing
5. Fayl yuklab olinishi kerak

### Agar 404 Error:

APK fayl mavjudligini tekshiring:
```
http://192.168.100.246:5000/api/apk/info
```

Natija:
```json
{
  "exists": true,
  "size_mb": 0.05,
  "filename": "rentcar.apk"
}
```

## 6. Production Deploy

Production'da (masalan, Netlify/Vercel):

1. Backend'ni VPS/Cloud'ga deploy qiling
2. APKDownload.tsx'da URL'ni yangilang:

```typescript
const backendUrl = 'https://api.rentcar.uz'  // Production URL
```

## 7. Muammolar va Yechimlar

### "Fayl yuklanmadi"
- Firewall'ni tekshiring
- IP manzilni tekshiring
- Backend ishlab turganini tekshiring

### "Connection refused"
- Kompyuter va telefon bir Wi-Fi'da emasligini tekshiring
- Backend 0.0.0.0 da ishlab turganini tekshiring

### "404 Not Found"
- APK fayl `apk/rentcar.apk` da mavjudligini tekshiring
- Backend qayta ishga tushiring

## 8. Haqiqiy APK Yaratish

Hozircha test fayli bor. Haqiqiy APK uchun:

```bash
cd frontend
npm run build
npx cap sync android
npx cap open android
# Android Studio'da: Build > Build APK
```

Tayyor APK'ni `apk/rentcar.apk` ga joylashtiring.

## Xulosa

✅ Telefon va kompyuter bir Wi-Fi'da
✅ Telefonda: http://192.168.100.246:3000
✅ APK yuklab olish ishlaydi
✅ Firewall ruxsat bergan

Savollar bo'lsa, README.md'ni o'qing!
