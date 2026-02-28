'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Home, Calendar, Phone, Mail, Clock, FileCheck } from 'lucide-react'
import Navbar from '@/components/Navbar'
import APKDownload from '@/components/APKDownload'

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('id')

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-black">
      <Navbar />
      <APKDownload />
      
      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/50 animate-pulse">
                  <CheckCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Bron muvaffaqiyatli yaratildi!
              </h1>
              <p className="text-xl text-gray-300">
                Sizning buyurtmangiz qabul qilindi va tez orada ko'rib chiqiladi
              </p>
            </div>

       

            {/* Steps Card */}
            <div className="card mb-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-400" />
                Keyingi qadamlar
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/50">
                    <span className="text-white text-lg font-bold">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1 text-lg">Tasdiqlash</h3>
                    <p className="text-sm text-gray-400">
                      Sizning buyurtmangiz 5-10 daqiqa ichida ko'rib chiqiladi va tasdiqlanadi
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/50">
                    <span className="text-white text-lg font-bold">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1 text-lg">Xabarnoma</h3>
                    <p className="text-sm text-gray-400">
                      Tasdiqlangandan so'ng siz email va telefon orqali xabar beramiz
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/50">
                    <span className="text-white text-lg font-bold">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1 text-lg">Qabul qilish</h3>
                    <p className="text-sm text-gray-400">
                      Belgilangan sanada avtomobilni ofisimizdan olib ketishingiz mumkin
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <Link 
                href="/"
                className="group relative overflow-hidden bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Home className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Bosh sahifa</span>
              </Link>
              
              <Link 
                href="/cars"
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-blue-500/50"
              >
                <Calendar className="w-5 h-5" />
                <span>Boshqa mashinalar</span>
              </Link>
            </div>

            {/* Contact Info
            <div className="card bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-500/30">
              <div className="text-center">
                <FileCheck className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Savollaringiz bormi?</h3>
                <p className="text-gray-400 mb-4">Biz bilan bog'laning, yordam berishga tayyormiz</p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="tel:+998901234567" 
                    className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                  >
                    <Phone className="w-5 h-5 text-green-400" />
                    <span>+998 90 123 45 67</span>
                  </a>
                  
                  <a 
                    href="mailto:info@rentcar.uz" 
                    className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                  >
                    <Mail className="w-5 h-5 text-blue-400" />
                    <span>info@rentcar.uz</span>
                  </a>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </section>
    </div>
  )
}
