'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from 'lucide-react'
import { Toast } from '@/components/Toast'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subject: '',
    message: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handlePhoneChange = (value: string | undefined) => {
    if (!value) {
      setFormData(prev => ({
        ...prev,
        phone: ''
      }))
      return
    }

    // Faqat raqamlar va + belgisini qabul qil
    let cleaned = value.replace(/[^\d+]/g, '')
    
    // +998 bilan boshlanishi kerak
    if (cleaned && !cleaned.startsWith('+998')) {
      // Agar +998 bo'lmasa, qo'shib qo'y
      cleaned = '+998' + cleaned.replace(/^\+?998/, '')
    }
    
    // +998 dan keyin maksimal 9 ta raqam
    if (cleaned.startsWith('+998')) {
      const digits = cleaned.slice(4) // +998 dan keyin
      if (digits.length > 9) {
        cleaned = '+998' + digits.slice(0, 9)
      }
    }
    
    setFormData(prev => ({
      ...prev,
      phone: cleaned
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.phone,
          subject: formData.subject,
          message: formData.message
        })
      })

      if (response.ok) {
        setToastMessage('✅ Xabaringiz muvaffaqiyatli yuborildi!')
        setShowToast(true)
        setFormData({ name: '', phone: '', subject: '', message: '' })
      } else {
        setToastMessage('❌ Xatolik yuz berdi')
        setShowToast(true)
      }
    } catch (error) {
      setToastMessage('❌ Xatolik yuz berdi')
      setShowToast(true)
    } finally {
      setLoading(false)
    }
  }

  const handleInstagram = () => {
    window.open('https://www.instagram.com/rentcar.samarkand?igsh=MWc4czNlYnFxbTdjMw==', '_blank')
  }

  const handleTelegram = () => {
    window.open('https://t.me/rentcarsamarkand', '_blank')
  }

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#001122] to-[#0a0e1a]">
      <Navbar />
      
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastMessage.includes('✅') ? 'success' : 'error'}
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Header Section */}
      <section className="pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Biz bilan bog'lanish
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
              Har qanday savol yoki taklifingiz uchun biz shu yerda mavjudmiz. 24/7 qo'llab-quvvatlash
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16 sm:pb-20 md:pb-24">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            
            {/* Left Side - Form (Yuborish) */}
            <div>
              <div className="bg-gradient-to-br from-white/5 to-white/10 border border-white/20 rounded-3xl p-8 sm:p-10 backdrop-blur-xl">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">
                  Xabar yuborish
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Ism */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-3 font-medium">
                      Ismingiz
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ismingizni kiriting"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Telefon */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-3 font-medium">
                      Telefon raqami
                    </label>
                    <PhoneInput
                      international
                      countryCallingCodeEditable={false}
                      defaultCountry="UZ"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="+998 XX XXX XX XX"
                      maxLength={13}
                      className="phone-input-wrapper"
                    />
                    <p className="text-xs text-gray-400 mt-2">+998 dan keyin 9 ta raqam</p>
                    <style jsx>{`
                      :global(.phone-input-wrapper input) {
                        width: 100%;
                        padding: 0.75rem 1rem;
                        background-color: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        border-radius: 0.75rem;
                        color: white;
                        font-size: 1rem;
                        transition: all 0.2s;
                      }
                      :global(.phone-input-wrapper input::placeholder) {
                        color: rgb(107, 114, 128);
                      }
                      :global(.phone-input-wrapper input:focus) {
                        outline: none;
                        ring: 2px;
                        ring-color: rgb(59, 130, 246);
                        border-color: transparent;
                      }
                    `}</style>
                  </div>

                  {/* Mavzu */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-3 font-medium">
                      Mavzu
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Xabaringizning mavzusi"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Xabar */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-3 font-medium">
                      Xabar
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Sizning xabaringiz..."
                      rows={5}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl"
                  >
                    <Send className="w-5 h-5" />
                    {loading ? 'Yuborilmoqda...' : 'Xabar yuborish'}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Side - Contact Info (Aloqa ma'lumotlari) */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                Aloqa ma'lumotlari
              </h2>

              <div className="space-y-4">
                {/* Telefon */}
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-5 hover:border-blue-500/60 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-base font-semibold text-white">Telefon</h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <button
                        onClick={() => handleCall('+998953301111')}
                        className="block w-full text-left text-white hover:text-blue-300 transition-colors text-sm font-bold mb-1"
                      >
                        +998 95 330 11 11
                      </button>
                      <button
                        onClick={() => handleCall('+998970951111')}
                        className="block w-full text-left text-white hover:text-blue-300 transition-colors text-sm font-bold"
                      >
                        +998 97 095 11 11
                      </button>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-blue-500/20">
                      <button
                        onClick={() => handleInstagram()}
                        className="flex-1 bg-pink-500/20 hover:bg-pink-500/40 text-pink-300 px-2 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        Instagram
                      </button>
                      <button
                        onClick={() => handleTelegram()}
                        className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 px-2 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        Telegram
                      </button>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-5 hover:border-purple-500/60 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-base font-semibold text-white">Email</h3>
                  </div>
                  <a href="mailto:rentacar111sam@gmail.com" className="text-white hover:text-purple-300 transition-colors break-all text-sm font-medium">
                    rentacar111sam@gmail.com
                  </a>
                </div>

                {/* Manzil */}
                <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-5 hover:border-orange-500/60 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-orange-400" />
                    </div>
                    <h3 className="text-base font-semibold text-white">Manzil</h3>
                  </div>
                  <p className="text-white text-sm font-medium">
                    Samarqand shahar, Mirzo Ulugbek ko'chasi, 48-uy
                  </p>
                </div>

                {/* Ish vaqti */}
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-5 hover:border-green-500/60 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-green-400" />
                    </div>
                    <h3 className="text-base font-semibold text-white">Ish vaqti</h3>
                  </div>
                  <p className="text-white text-sm font-bold mb-0.5">24/7 Ochiq</p>
                  <p className="text-gray-400 text-xs">Har kuni, har vaqtda xizmatda</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  )
}
