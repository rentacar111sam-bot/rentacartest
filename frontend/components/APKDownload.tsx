'use client'

import { useState } from 'react'
import { Download, Smartphone, AlertCircle, CheckCircle, X } from 'lucide-react'

export default function APKDownload() {
  const [showModal, setShowModal] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const detectPlatform = () => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
    
    // Android detection
    if (/android/i.test(userAgent)) {
      return 'android'
    }
    
    // iOS detection
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      return 'ios'
    }
    
    // Desktop
    return 'desktop'
  }

  const handleDownloadClick = () => {
    // Har qanday platformadan yuklab olish imkoniyati
    setShowModal(true)
  }

  const startDownload = () => {
    setDownloading(true)
    
    const platform = detectPlatform()
    
    // Create download link - backend'dan yuklab olish
    // Telefon uchun local IP ishlatish
    const backendUrl = window.location.hostname === 'localhost' 
      ? 'http://192.168.100.246:5000'  // Telefon uchun
      : `${window.location.protocol}//${window.location.hostname}:5000`  // Production uchun
    
    const link = document.createElement('a')
    link.href = `${backendUrl}/api/apk/download`
    link.download = 'RentCar.apk'
    link.target = '_blank'  // Yangi tabda ochish
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Platform-specific success messages
    setTimeout(() => {
      setDownloading(false)
      setShowModal(false)
      
      if (platform === 'android') {
        alert('✅ Yuklab olish boshlandi!\n\nFayl yuklab olingandan keyin, uni oching va o\'rnatish jarayonini boshlang.')
      } else if (platform === 'ios') {
        alert('✅ Yuklab olish boshlandi!\n\n⚠️ Eslatma: APK faqat Android uchun. iPhone\'da ishlamaydi.\n\nAndroid qurilmangizga o\'tkazing yoki veb-saytdan foydalaning.')
      } else {
        alert('✅ Yuklab olish boshlandi!\n\nFaylni Android qurilmangizga o\'tkazing:\n1. USB orqali\n2. Bluetooth orqali\n3. Google Drive/Telegram orqali\n\nKeyin Android\'da ochib o\'rnating.')
      }
    }, 1000)
  }

  return (
    <>
      {/* APK Download Button - Fixed at bottom */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40">
        <button
          onClick={handleDownloadClick}
          className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-full shadow-2xl hover:shadow-green-500/50 transition-all duration-300 flex items-center gap-2 sm:gap-3 font-semibold text-sm sm:text-base transform hover:scale-105 animate-pulse hover:animate-none"
          aria-label="APK yuklab olish"
        >
          <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="hidden sm:inline">APK Yuklab Olish</span>
          <span className="sm:hidden">APK</span>
          <Download className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-bounce" />
        </button>
      </div>

      {/* Instructions Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-navy-800 to-navy-900 border-2 border-green-500/30 rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl animate-slide-in max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl relative sticky top-0 z-10">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
                aria-label="Yopish"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">RentCar APK</h2>
                  <p className="text-white/90 text-xs sm:text-sm">Android ilovasi</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Platform Detection */}
              <div className={`border rounded-xl p-3 sm:p-4 flex items-start gap-3 ${
                detectPlatform() === 'android' 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-yellow-500/10 border-yellow-500/30'
              }`}>
                <AlertCircle className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5 ${
                  detectPlatform() === 'android' ? 'text-green-500' : 'text-yellow-500'
                }`} />
                <div>
                  <h3 className={`font-semibold text-sm sm:text-base mb-1 ${
                    detectPlatform() === 'android' ? 'text-green-500' : 'text-yellow-500'
                  }`}>
                    {detectPlatform() === 'android' && '✅ Android qurilma aniqlandi'}
                    {detectPlatform() === 'ios' && '⚠️ iOS qurilma aniqlandi'}
                    {detectPlatform() === 'desktop' && '💻 Kompyuter aniqlandi'}
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm">
                    {detectPlatform() === 'android' && 'APK faylni to\'g\'ridan-to\'g\'ri o\'rnatishingiz mumkin!'}
                    {detectPlatform() === 'ios' && 'APK faqat Android uchun. iPhone\'da ishlamaydi. Faylni Android qurilmangizga o\'tkazing.'}
                    {detectPlatform() === 'desktop' && 'APK faylni yuklab olib, Android qurilmangizga o\'tkazing (USB, Bluetooth, yoki cloud orqali).'}
                  </p>
                </div>
              </div>

              {/* Warning for Android */}
              {detectPlatform() === 'android' && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 sm:p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-500 text-sm sm:text-base mb-1">Muhim eslatma!</h3>
                    <p className="text-gray-300 text-xs sm:text-sm">
                      APK o'rnatish uchun telefon sozlamalarida <strong>"Noma'lum manbalar"</strong> (Unknown sources) yoqilgan bo'lishi kerak.
                    </p>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="space-y-3">
                <h3 className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  {detectPlatform() === 'android' && 'O\'rnatish qadamlari:'}
                  {detectPlatform() === 'ios' && 'Android\'ga o\'tkazish qadamlari:'}
                  {detectPlatform() === 'desktop' && 'Android\'ga o\'tkazish qadamlari:'}
                </h3>
                
                {detectPlatform() === 'android' && (
                  <ol className="space-y-2 text-gray-300 text-xs sm:text-sm">
                    <li className="flex items-start gap-2">
                      <span className="bg-green-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                      <span>Pastdagi tugmani bosing va APK faylni yuklab oling</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-green-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                      <span>Yuklab olingan faylni oching</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-green-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                      <span>Agar so'ralsa, "Noma'lum manbalar"ni ruxsat bering</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-green-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</span>
                      <span>"O'rnatish" tugmasini bosing</span>
                    </li>
                  </ol>
                )}

                {(detectPlatform() === 'ios' || detectPlatform() === 'desktop') && (
                  <ol className="space-y-2 text-gray-300 text-xs sm:text-sm">
                    <li className="flex items-start gap-2">
                      <span className="bg-green-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                      <span>Pastdagi tugmani bosing va APK faylni yuklab oling</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-green-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                      <span>Faylni Android qurilmangizga o'tkazing:</span>
                    </li>
                    <li className="ml-7 space-y-1 text-xs">
                      <div>• USB kabel orqali</div>
                      <div>• Bluetooth orqali</div>
                      <div>• Google Drive/Telegram orqali</div>
                      <div>• Email orqali</div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-green-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                      <span>Android qurilmada faylni oching va o'rnating</span>
                    </li>
                  </ol>
                )}
              </div>

              {/* App Info */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Fayl hajmi:</span>
                  <span className="font-semibold text-white">~25 MB</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Versiya:</span>
                  <span className="font-semibold text-white">1.0.0</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Android:</span>
                  <span className="font-semibold text-white">5.0+</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Platforma:</span>
                  <span className="font-semibold text-white">
                    {detectPlatform() === 'android' && '✅ Android'}
                    {detectPlatform() === 'ios' && '📱 iOS'}
                    {detectPlatform() === 'desktop' && '💻 Desktop'}
                  </span>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={startDownload}
                disabled={downloading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 sm:py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-green-500/50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {downloading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Yuklanmoqda...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>APK Faylni Yuklab Olish</span>
                  </>
                )}
              </button>

              {/* Cancel Button */}
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2.5 sm:py-3 rounded-xl transition-all text-sm sm:text-base"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
