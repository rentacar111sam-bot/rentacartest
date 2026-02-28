# RentCar APK Yaratish Qo'llanmasi

## Talab qilinadigan Dasturlar

1. **Node.js** (v16 yoki undan yuqori)
2. **Java Development Kit (JDK)** (v11 yoki undan yuqori)
3. **Android SDK** (Android Studio orqali o'rnatiladi)
4. **Gradle** (Android Studio bilan birga keladi)

## O'rnatish Bosqichlari

### 1. Android Studio o'rnatish
- [Android Studio](https://developer.android.com/studio) dan yuklab oling
- O'rnatib, Android SDK va emulator o'rnatib oling

### 2. Environment Variables o'rnatish (Windows)

```powershell
# JAVA_HOME
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-11", "User")

# ANDROID_HOME
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\YourUsername\AppData\Local\Android\Sdk", "User")

# PATH ga qo'shish
$env:Path += ";C:\Program Files\Java\jdk-11\bin"
$env:Path += ";C:\Users\YourUsername\AppData\Local\Android\Sdk\platform-tools"
$env:Path += ";C:\Users\YourUsername\AppData\Local\Android\Sdk\tools"
```

### 3. Loyihani Build qilish

```bash
cd frontend

# Dependencies o'rnatish
npm install

# Production build yaratish
npm run build

# Capacitor Android qo'shish
npx cap add android

# Sync qilish
npx cap sync

# Android Studio da ochish
npx cap open android
```

### 4. Android Studio da APK yaratish

1. Android Studio da `android` papkasini oching
2. **Build** menyu → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Yoki **Build** menyu → **Build Signed Bundle / APK**
4. APK fayl `android/app/build/outputs/apk/debug/` papkasida bo'ladi

### 5. Release APK yaratish (Imzolangan)

1. Android Studio da **Build** → **Generate Signed Bundle / APK**
2. Keystore faylini tanlang yoki yangi yarating
3. Release build yaratiladi

## Tez Buyruqlar

```bash
# Barcha bosqichlarni bir vaqtda bajarish
npm run build:apk

# Faqat sync qilish
npm run cap:sync

# Android Studio da ochish
npm run cap:open
```

## Muammolarni Hal Qilish

### Gradle xatosi
```bash
cd android
./gradlew clean
./gradlew build
```

### Capacitor xatosi
```bash
npm install -g @capacitor/cli
npx cap sync
```

### Java xatosi
- JAVA_HOME to'g'ri o'rnatilganligini tekshiring
- `java -version` buyrug'ini ishga tushiring

## APK Fayl Joylashuvi

- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/bundle/release/app-release.aab`

## Qo'shimcha Resurslar

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [Next.js Export](https://nextjs.org/docs/advanced-features/static-html-export)

## PWA Xususiyatlari

- ✅ Offline ishlash
- ✅ Push notifications
- ✅ Home screen qo'shish
- ✅ Tez yuklash
- ✅ Responsive dizayn

## Deployment

### Web (PWA)
```bash
npm run build
# `out` papkasini hosting-ga yuklang
```

### Mobile (APK)
```bash
npm run build:apk
# APK faylni Play Store-ga yuklang
```
