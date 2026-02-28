'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface Car {
  id: number
  name: string
  category: string
  price: number
  image: string
  features: string[]
  year: number
  fuel: string
  transmission: string
  has_ac: boolean
  seats: number
  fuel_consumption: number
  quantity: number
  available: boolean
}

export default function CarDetailPage() {
  const params = useParams()
  const carId = params.id as string
  
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [imageError, setImageError] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    loadCar()
  }, [carId])

  const loadCar = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`http://localhost:5000/api/cars?id=${carId}`)
      
      if (!response.ok) {
        throw new Error('Avtomobil topilmadi')
      }

      const data = await response.json()
      if (data) {
        setCar(data)
      } else {
        throw new Error('Avtomobil topilmadi')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const categoryLabels: Record<string, string> = {
    byudjetillar: 'Byudjetillar',
    komfortli: 'Komfortli',
    premiumlar: 'Premiumlar',
    krossoverlar: 'Krossoverlar'
  }

  const calculateDays = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const totalDays = calculateDays()
  const totalPrice = car ? car.price * totalDays : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-800/50 rounded-lg mb-6"></div>
            <div className="h-8 bg-gray-800/50 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-800/50 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-3xl font-bold text-white mb-2">Avtomobil topilmadi</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            <Link
              href="/cars"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              Katalogga qaytish
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800">
      <Navbar />

      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-12 md:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/cars" className="hover:text-white transition-colors">
            Mashinalar
          </Link>
          <span>/</span>
          <span className="text-white">{car.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="relative h-96 sm:h-[500px] rounded-2xl overflow-hidden bg-gray-900 mb-6 border border-white/10 shadow-2xl">
              {!imageError ? (
                <Image
                  src={car.image || '/placeholder-car.svg'}
                  alt={car.name}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-24 h-24 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-4 left-4 right-4 flex justify-between">
                {car.quantity > 0 && (
                  <div className="px-4 py-2 rounded-full text-sm font-semibold bg-green-500/20 text-green-300 border border-green-500/30 backdrop-blur-sm">
                    ✓ Mavjud
                  </div>
                )}
                <div className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-sm">
                  {categoryLabels[car.category]}
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {car.year && (
                <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-4 backdrop-blur-sm hover:border-white/40 transition-all">
                  <div className="text-xs text-gray-400 mb-2">Yili</div>
                  <div className="text-2xl font-bold text-white">{car.year}</div>
                </div>
              )}
              
              {car.fuel && (
                <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-4 backdrop-blur-sm hover:border-white/40 transition-all">
                  <div className="text-xs text-gray-400 mb-2">Yoqilg'i</div>
                  <div className="text-lg font-bold text-white">{car.fuel}</div>
                </div>
              )}
              
              {car.transmission && (
                <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-4 backdrop-blur-sm hover:border-white/40 transition-all">
                  <div className="text-xs text-gray-400 mb-2">Transmissiya</div>
                  <div className="text-lg font-bold text-white">{car.transmission}</div>
                </div>
              )}
              
              {car.seats && (
                <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-4 backdrop-blur-sm hover:border-white/40 transition-all">
                  <div className="text-xs text-gray-400 mb-2">O'rinlar</div>
                  <div className="text-2xl font-bold text-white">{car.seats}</div>
                </div>
              )}
            </div>

            {/* Features */}
            {car.features && car.features.length > 0 && (
              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-4">Xususiyatlari</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {car.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-300">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column - Booking Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-white/20 rounded-2xl p-6 backdrop-blur-sm sticky top-24 shadow-2xl">
              
              {/* Title */}
              <h1 className="text-2xl font-bold text-white mb-1">
                {car.name}
              </h1>
              <p className="text-gray-400 text-sm mb-4">{categoryLabels[car.category]} avtomobil</p>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-white/10">
                <div className="text-sm text-gray-400 mb-2">Kunlik narx</div>
                <div className="text-4xl font-bold text-white">
                  {formatPrice(car.price)}
                </div>
              </div>

              {/* Date Selection */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Boshlanish sanasi</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Tugash sanasi</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-all"
                  />
                </div>
              </div>

              {/* Summary */}
              {totalDays > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Kunlar soni:</span>
                    <span className="text-white font-semibold">{totalDays} kun</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Kunlik narx:</span>
                    <span className="text-white font-semibold">{formatPrice(car.price)}</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between">
                    <span className="text-white font-semibold">Jami:</span>
                    <span className="text-2xl font-bold text-blue-400">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              )}

              {/* Booking Button */}
              <Link
                href={`/booking?car_id=${car.id}${startDate ? `&start_date=${startDate}` : ''}${endDate ? `&end_date=${endDate}` : ''}`}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 block text-center ${
                  car.available && car.quantity > 0
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed opacity-50'
                }`}
              >
                {car.available && car.quantity > 0 ? 'Bronlash' : 'Mavjud emas'}
              </Link>

              {/* Info */}
              <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-xs text-blue-200">
                  📞 +998 (90) 123-45-67
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
