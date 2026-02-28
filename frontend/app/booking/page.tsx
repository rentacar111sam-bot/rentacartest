'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Upload, CheckCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import APKDownload from '@/components/APKDownload'
import { Toast } from '@/components/Toast'
import { getAllCars, createBooking, formatPrice } from '@/lib/api'
import { Car } from '@/types'
import Image from 'next/image'

export default function BookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [cars, setCars] = useState<Car[]>([])
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  
  const [formData, setFormData] = useState({
    carId: '',
    startDate: '',
    endDate: '',
    firstName: '',
    lastName: '',
    phone: '',
  })
  
  const [phoneValue, setPhoneValue] = useState<string>('')
  const [bookedDates, setBookedDates] = useState<string[]>([])
  const [totalDays, setTotalDays] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [files, setFiles] = useState({
    passportFront: null as File | null,
    passportBack: null as File | null,
    paymentReceipt: null as File | null
  })

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 9) {
      setPhoneValue(value)
      setFormData(prev => ({ ...prev, phone: '+998' + value }))
    }
  }

  const loadBookedDates = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bookings')
      const data = await response.json()
      const booked: string[] = []
      data.bookings?.forEach((booking: any) => {
        if (booking.status === 'pending' || booking.status === 'confirmed') {
          const start = new Date(booking.start_date)
          const end = new Date(booking.end_date)
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            booked.push(d.toISOString().split('T')[0])
          }
        }
      })
      setBookedDates(booked)
    } catch (error) {
      console.error('Error loading booked dates:', error)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setToast({ message: 'Bronlash uchun avval kiring', type: 'info' })
      setTimeout(() => {
        router.push('/auth')
      }, 1500)
      return
    }
    loadCars()
    loadBookedDates()
  }, [])

  useEffect(() => {
    if (cars.length > 0) {
      const carParam = searchParams.get('car_id') || searchParams.get('car')
      if (carParam) {
        setFormData(prev => ({ ...prev, carId: carParam }))
      } else {
        // Agar carId bo'lmasa, mashinalar sahifasiga qaytarish
        setToast({ message: 'Iltimos, mashinani tanlang', type: 'info' })
        setTimeout(() => {
          router.push('/cars')
        }, 1500)
      }
    }
  }, [cars, searchParams])

  useEffect(() => {
    if (formData.carId && cars.length > 0) {
      const car = cars.find(c => c.id.toString() === formData.carId)
      setSelectedCar(car || null)
    }
  }, [formData.carId, cars])

  const loadCars = async () => {
    try {
      const data = await getAllCars()
      setCars(data)
    } catch (error) {
      console.error('Avtomobillarni yuklashda xatolik:', error)
      setToast({ message: 'Avtomobillarni yuklashda xatolik', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Calculate total days and price when dates change
    if ((name === 'startDate' || name === 'endDate') && selectedCar) {
      const start = name === 'startDate' ? new Date(value) : new Date(formData.startDate)
      const end = name === 'endDate' ? new Date(value) : new Date(formData.endDate)
      
      if (start && end && start < end) {
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        const price = days * selectedCar.price
        setTotalDays(days)
        setTotalPrice(price)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({
        ...prev,
        [field]: e.target.files![0]
      }))
    }
  }

  const validateStep1 = () => {
    if (!formData.carId || !formData.startDate || !formData.endDate) {
      setToast({ message: 'Barcha maydonlarni to\'ldiring', type: 'error' })
      return false
    }
    
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      if (bookedDates.includes(dateStr)) {
        setToast({ message: `${dateStr} sanasi bron qilingan. Boshqa sanalarni tanlang.`, type: 'error' })
        return false
      }
    }
    
    return true
  }

  const validateStep2 = () => {
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      setToast({ message: 'Barcha maydonlarni to\'ldiring', type: 'error' })
      return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2)
    else if (step === 2 && validateStep2()) setStep(3)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreedToTerms) {
      setToast({ message: 'Shartlarni qabul qiling', type: 'error' })
      return
    }
    setSubmitting(true)
    try {
      const bookingData = new FormData()
      bookingData.append('carId', formData.carId)
      bookingData.append('startDate', formData.startDate)
      bookingData.append('endDate', formData.endDate)
      bookingData.append('firstName', formData.firstName)
      bookingData.append('lastName', formData.lastName)
      bookingData.append('phone', formData.phone)
      
      if (!files.passportFront) {
        setToast({ message: 'Pasport oldini yuklang', type: 'error' })
        setSubmitting(false)
        return
      }
      if (!files.passportBack) {
        setToast({ message: 'Pasport orqasini yuklang', type: 'error' })
        setSubmitting(false)
        return
      }
      if (!files.paymentReceipt) {
        setToast({ message: 'To\'lov chekini yuklang', type: 'error' })
        setSubmitting(false)
        return
      }
      
      bookingData.append('passportFront', files.passportFront)
      bookingData.append('passportBack', files.passportBack)
      bookingData.append('paymentReceipt', files.paymentReceipt)
      
      const result = await createBooking(bookingData)
      
      setToast({ message: 'Bron muvaffaqiyatli yaratildi!', type: 'success' })
      setTimeout(() => {
        router.push(`/booking/success?id=${result.booking_id}`)
      }, 1500)
    } catch (error: any) {
      console.error('Booking error:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Xatolik yuz berdi'
      setToast({ message: errorMessage, type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-black">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-gray-300">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-black flex flex-col">
      <Navbar />
      <APKDownload />
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <section className="flex-1 pt-12 sm:pt-16 md:pt-20 pb-6 sm:pb-8 md:pb-10">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 sm:mb-6 md:mb-8">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-0.5 sm:mb-1 md:mb-2">Bron qilish</h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-400">Oson va tez bron qilish jarayoni</p>
            </div>
            
            <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8 gap-0.5 sm:gap-1 md:gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-1 min-w-0">
                  <div className={`w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-xs sm:text-sm transition-all ${
                    step >= s ? 'bg-white text-navy-900 shadow-lg shadow-white/20' : 'bg-white/10 text-gray-400'
                  }`}>
                    {s}
                  </div>
                  {s < 3 && <div className={`flex-1 h-0.5 sm:h-1 mx-0.5 sm:mx-1 md:mx-2 transition-all ${step > s ? 'bg-white' : 'bg-white/10'}`}></div>}
                </div>
              ))}
            </div>

            <div className="w-full">
              <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-2xl">
                  {/* Step 1 - Date Selection */}
                  {step === 1 && (
                    <div className="space-y-3 sm:space-y-4 md:space-y-5">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Sanalarni tanlang</h2>
                      
                      {selectedCar && (
                        <div className="bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5">
                          <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3 font-semibold">Tanlangan avtomobil:</p>
                          <div className="flex gap-3 sm:gap-4 md:gap-5 mb-3 sm:mb-4 md:mb-5">
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden border border-white/10 shadow-lg">
                              <Image src={selectedCar.image} alt={selectedCar.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-white text-sm sm:text-base md:text-lg truncate">{selectedCar.name}</h3>
                              <p className="text-xs sm:text-sm md:text-base text-gray-400 mb-1.5 sm:mb-2">{formatPrice(selectedCar.price)}/kun</p>
                              <div className="space-y-0.5 text-xs sm:text-sm">
                                <div className="flex items-center text-gray-300">
                                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 sm:mr-2"></span>
                                  {selectedCar.has_ac ? '✓ Tanirofkali' : '✗ Tanirofkasiz'}
                                </div>
                                <div className="flex items-center text-gray-300">
                                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1.5 sm:mr-2"></span>
                                  {selectedCar.seats} o'rin
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-3 text-xs sm:text-sm border-t border-white/10 pt-2 sm:pt-3 md:pt-4">
                            <div className="flex items-center text-gray-300">
                              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-1.5 sm:mr-2"></span>
                              📅 {selectedCar.year}
                            </div>
                            <div className="flex items-center text-gray-300">
                              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-1.5 sm:mr-2"></span>
                              ⛽ {selectedCar.fuel}
                            </div>
                            <div className="flex items-center text-gray-300 col-span-2">
                              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-1.5 sm:mr-2"></span>
                              ⚙️ {selectedCar.transmission}
                            </div>
                            {selectedCar.fuel_consumption > 0 && (
                              <div className="flex items-center text-gray-300 col-span-2">
                                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1.5 sm:mr-2"></span>
                                🔋 100 kmga: {selectedCar.fuel_consumption} L
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5 sm:mb-2">Boshlang'ich sana</label>
                            <input 
                              type="date" 
                              name="startDate" 
                              value={formData.startDate} 
                              onChange={handleInputChange} 
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-white/5 border border-white/20 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-white/50" 
                              required 
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5 sm:mb-2">Tugash sanasi</label>
                            <input 
                              type="date" 
                              name="endDate" 
                              value={formData.endDate} 
                              onChange={handleInputChange} 
                              min={formData.startDate}
                              className="w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-white/5 border border-white/20 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-white/50" 
                              required 
                            />
                          </div>
                        </div>

                        {totalDays > 0 && selectedCar && (
                          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5">
                            <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm md:text-base text-gray-300">Kunlar soni:</span>
                                <span className="text-base sm:text-lg md:text-xl font-bold text-green-300">{totalDays} kun</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm md:text-base text-gray-300">1 kunlik narx:</span>
                                <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-200">{formatPrice(selectedCar.price)}</span>
                              </div>
                              <div className="border-t border-green-500/30 pt-1.5 sm:pt-2 md:pt-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm sm:text-base md:text-lg font-bold text-gray-200">Umumiy narx:</span>
                                  <span className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                    {formatPrice(totalPrice)}
                                  </span>
                                </div>
                                <p className="text-xs text-green-300/70 mt-0.5 sm:mt-1">
                                  {formatPrice(selectedCar.price)} × {totalDays} = {formatPrice(totalPrice)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {bookedDates.length > 0 && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg sm:rounded-xl md:rounded-2xl p-2.5 sm:p-3 md:p-4">
                          <p className="text-xs sm:text-sm font-semibold text-red-300 mb-1.5 sm:mb-2">⚠️ Bron qilingan kunlar:</p>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {bookedDates.slice(0, 10).map((date, idx) => (
                              <span key={idx} className="text-xs bg-red-500/20 text-red-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                                {new Date(date).toLocaleDateString('uz-UZ')}
                              </span>
                            ))}
                            {bookedDates.length > 10 && (
                              <span className="text-xs bg-red-500/20 text-red-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                                +{bookedDates.length - 10} ko'proq
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-1.5 sm:gap-2 md:gap-3 pt-1.5 sm:pt-2 md:pt-4">
                        <button type="button" onClick={() => router.push('/cars')} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 sm:py-2.5 md:py-3 rounded-lg border border-white/20 transition-all text-xs sm:text-sm md:text-base">Mashinalarga QAYTISH</button>
                        <button type="button" onClick={handleNext} className="flex-1 bg-white hover:bg-gray-100 text-navy-900 font-semibold py-2 sm:py-2.5 md:py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs sm:text-sm md:text-base" disabled={!formData.startDate || !formData.endDate || !selectedCar}>Keyingi</button>
                      </div>
                    </div>
                  )}

                  {/* Step 2 - Personal Info & Documents */}
                  {step === 2 && (
                    <div className="space-y-3 sm:space-y-4 md:space-y-5">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Shaxsiy ma'lumotlar</h2>
                      
                      {/* Personal Information */}
                      <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-200">Shaxsiy Ma'lumotlar</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
                          <input 
                            type="text" 
                            name="firstName" 
                            value={formData.firstName} 
                            onChange={handleInputChange} 
                            placeholder="Ismingiz" 
                            className="px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-white/5 border border-white/20 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-white/50" 
                            required 
                          />
                          <input 
                            type="text" 
                            name="lastName" 
                            value={formData.lastName} 
                            onChange={handleInputChange} 
                            placeholder="Familiyangiz" 
                            className="px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-white/5 border border-white/20 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-white/50" 
                            required 
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5 sm:mb-2">Telefon raqami</label>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="flex items-center justify-center px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-white/5 border border-white/20 rounded-lg text-white font-semibold text-xs sm:text-sm whitespace-nowrap">
                              +998
                            </div>
                            <input
                              type="tel"
                              value={phoneValue}
                              onChange={handlePhoneChange}
                              className="flex-1 px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-white/5 border border-white/20 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                              placeholder="XX XXX XX XX"
                              maxLength={9}
                              required
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 sm:mt-1">9 ta raqam kiriting</p>
                        </div>
                      </div>

                      {/* Passport Documents */}
                      <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-200">Pasport Hujjatlari</h3>
                        <FileUploadField 
                          label="Pasport (Old tomoni)" 
                          file={files.passportFront} 
                          onChange={(e) => handleFileChange(e, 'passportFront')} 
                        />
                        <FileUploadField 
                          label="Pasport (Orqa tomoni)" 
                          file={files.passportBack} 
                          onChange={(e) => handleFileChange(e, 'passportBack')} 
                        />
                      </div>

                      {/* Payment Card Section */}
                      <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/40 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5">
                          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-blue-200 mb-2 sm:mb-3">💳 Zalog To'lovi uchun karta 8600.5304.2022.7475 Alisher. A</h3>
                          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-300">Umumiy narx:</span>
                              <span className="font-semibold text-gray-200">{formatPrice(totalPrice)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-300">Zalog (60%):</span>
                              <span className="font-bold text-blue-300">{formatPrice(totalPrice * 0.6)}</span>
                            </div>
                            <p className="text-xs text-blue-300/70 mt-1 sm:mt-1.5">
                              Siz {formatPrice(totalPrice * 0.6)} so'm zalog to'lashingiz kerak
                            </p>
                          </div>
                        </div>

                        <FileUploadField 
                          label={`To'lov Cheki (${formatPrice(totalPrice * 0.6)} zalog)`}
                          file={files.paymentReceipt} 
                          onChange={(e) => handleFileChange(e, 'paymentReceipt')} 
                        />
                      </div>

                      <div className="flex gap-1.5 sm:gap-2 md:gap-3 pt-1.5 sm:pt-2 md:pt-4">
                        <button 
                          type="button" 
                          onClick={() => setStep(1)} 
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 sm:py-2.5 md:py-3 rounded-lg border border-white/20 transition-all text-xs sm:text-sm md:text-base"
                        >
                          Orqaga
                        </button>
                        <button 
                          type="button" 
                          onClick={handleNext} 
                          className="flex-1 bg-white hover:bg-gray-100 text-navy-900 font-semibold py-2 sm:py-2.5 md:py-3 rounded-lg transition-all text-xs sm:text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!formData.firstName || !formData.lastName || phoneValue.length !== 9 || !files.passportFront || !files.passportBack || !files.paymentReceipt}
                        >
                          Keyingi
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3 - Terms & Confirmation */}
                  {step === 3 && (
                    <div className="space-y-3 sm:space-y-4 md:space-y-5">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Shartlar va Tasdiqlash</h2>
                      
                      {/* Summary */}
                      <div className="bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 space-y-2 sm:space-y-3">
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-200">Bron Xulasasi</h3>
                        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Avtomobil:</span>
                            <span className="font-semibold text-white">{selectedCar?.name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Kunlar:</span>
                            <span className="font-semibold text-white">{totalDays} kun</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Umumiy narx:</span>
                            <span className="font-semibold text-white">{formatPrice(totalPrice)}</span>
                          </div>
                          <div className="border-t border-white/10 pt-1.5 sm:pt-2 mt-1.5 sm:mt-2">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Zalog (60%):</span>
                              <span className="font-bold text-green-300">{formatPrice(totalPrice * 0.6)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Terms */}
                      <div className="bg-white/5 border border-white/20 rounded-lg sm:rounded-xl md:rounded-2xl p-2.5 sm:p-3 md:p-4 max-h-40 sm:max-h-48 md:max-h-56 overflow-y-auto text-xs sm:text-sm text-gray-300 whitespace-pre-wrap">
                        Bron qilish shartlari va qoidalari. Avtomobilni vaqtida qaytarish majburiy. Zalog to'lovi qaytarilmaydi agar avtomobil shikastlanib qaytarilsa.
                      </div>
                      
                      <div className="flex items-start gap-2 sm:gap-3 bg-white/5 border border-white/20 rounded-lg sm:rounded-xl md:rounded-2xl p-2.5 sm:p-3 md:p-4">
                        <input 
                          type="checkbox" 
                          id="terms" 
                          checked={agreedToTerms} 
                          onChange={(e) => setAgreedToTerms(e.target.checked)} 
                          className="w-4 h-4 sm:w-5 sm:h-5 rounded cursor-pointer mt-0.5 sm:mt-1 flex-shrink-0" 
                        />
                        <label htmlFor="terms" className="text-xs sm:text-sm text-gray-300 cursor-pointer flex-1">
                          Barcha shartlarni o'qidim va qabul qilaman
                        </label>
                      </div>
                      
                      <div className="flex gap-1.5 sm:gap-2 md:gap-3 pt-1.5 sm:pt-2 md:pt-4">
                        <button 
                          type="button" 
                          onClick={() => setStep(2)} 
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 sm:py-2.5 md:py-3 rounded-lg border border-white/20 transition-all text-xs sm:text-sm md:text-base"
                        >
                          Orqaga
                        </button>
                        <button 
                          type="submit" 
                          disabled={submitting || !agreedToTerms} 
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 sm:py-2.5 md:py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs sm:text-sm md:text-base"
                        >
                          {submitting ? 'Yuborilmoqda...' : 'Tasdiqlash'}
                        </button>
                      </div>
                    </div>
                  )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function FileUploadField({ label, file, onChange }: { label: string; file: File | null; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div>
      <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5 sm:mb-2">{label}</label>
      <input type="file" onChange={onChange} accept="image/*,.pdf" className="hidden" id={label} />
      <label htmlFor={label} className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 border-2 border-dashed border-white/20 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
        {file ? (
          <>
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-400 flex-shrink-0" />
            <div className="text-left min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-white truncate">{file.name}</p>
              <p className="text-xs text-gray-400">Yuklandi</p>
            </div>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-400 flex-shrink-0" />
            <div className="text-left">
              <p className="text-xs sm:text-sm font-semibold text-white">Faylni tanlang</p>
              <p className="text-xs text-gray-400">yoki tashlang</p>
            </div>
          </>
        )}
      </label>
    </div>
  )
}
