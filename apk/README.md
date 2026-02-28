# APK Fayl Joylash

Bu papkaga **rentcar.apk** faylni joylashtiring.

## Qadamlar:

1. Android Studio'da APK yarating
2. APK faylni `rentcar.apk` deb nomlang
3. Bu papkaga joylashtiring: `apk/rentcar.apk`
4. Serverni qayta ishga tushiring

## Test:

APK mavjudligini tekshirish:
```
http://localhost:5000/api/apk/info
```

APK yuklab olish:
```
http://localhost:5000/api/apk/download
```

## Muhim:

- Fayl nomi: `rentcar.apk` (kichik harflar)
- Fayl hajmi: 50 MB dan kam bo'lishi tavsiya etiladi
- Fayl formati: `.apk`
