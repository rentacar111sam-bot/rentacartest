# RentCar PWA - Progressive Web App

## Xususiyatlar

✅ **Offline Ishlash** - Internet bo'lmasa ham ishlaydi
✅ **Push Notifications** - Yangiliklar haqida xabar olish
✅ **Home Screen** - Telefonning bosh ekraniga qo'shish
✅ **Tez Yuklash** - Service Worker orqali kesh qilish
✅ **Responsive** - Barcha qurilmalarda ishlaydi
✅ **APK Export** - Android app sifatida yuklab olish

## Ishga Tushirish

### Development
```bash
cd frontend
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### APK Yaratish
```bash
npm run build:apk
```

## PWA O'rnatish

### Web Brauzerda
1. Saytga kiring: http://localhost:3000
2. Brauzer menyusida "Install app" tugmasini bosing
3. Yoki "Add to Home Screen" (mobil)

### Android Telefonida
1. APK faylni yuklab oling
2. Faylni ochib, o'rnatish tugmasini bosing
3. Yoki Play Store-dan o'rnatish

## Konfiguratsiya

### manifest.json
- App nomi, tavsifi, ikonkalar
- Rang sxemasi, display mode
- Shortcuts va screenshots

### next.config.js
- PWA plugin konfiguratsiyasi
- Cache strategiyalari
- Runtime caching

### capacitor.config.ts
- Android app konfiguratsiyasi
- App ID, nomi, web directory

## Offline Ishlash

Service Worker quyidagi resurslarni kesh qiladi:
- HTML, CSS, JS fayllar
- Rasmlar va shriftlar
- API so'rovlari (5 minut)

## Push Notifications

```javascript
// Push notification yuborish
if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker.ready.then(registration => {
    registration.showNotification('RentCar', {
      body: 'Yangi avtomobil qo\'shildi!',
      icon: '/icon-192x192.png'
    })
  })
}
```

## Performance

- **Lighthouse Score**: 90+
- **First Contentful Paint**: < 2s
- **Time to Interactive**: < 3s
- **Cumulative Layout Shift**: < 0.1

## Debugging

### Chrome DevTools
1. F12 ni bosing
2. Application tab
3. Service Workers, Cache Storage, Manifest ko'ring

### Android
```bash
# USB Debug orqali
adb logcat
```

## Deployment

### Vercel
```bash
npm run build
# Vercel-ga push qiling
```

### Netlify
```bash
npm run build
# `out` papkasini Netlify-ga drag-drop qiling
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Muammolarni Hal Qilish

### Service Worker yangilash
```javascript
// Hard refresh
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### Cache tozalash
```javascript
// DevTools Console
caches.keys().then(names => {
  names.forEach(name => caches.delete(name))
})
```

### Offline test
- DevTools → Network → Offline checkbox

## Qo'shimcha Resurslar

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Capacitor Docs](https://capacitorjs.com/)

## Litsenziya

MIT License - Bepul foydalanish
