'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ChevronRight, Zap, Users, Fuel, Cog } from 'lucide-react'

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

interface CarCardProps {
  car: Car
}

const categoryLabels: Record<string, string> = {
  byudjetillar: 'Byudjetillar',
  komfortli: 'Komfortli',
  premiumlar: 'Premiumlar',
  krossoverlar: 'Krossoverlar'
}

const categoryColors: Record<string, string> = {
  byudjetillar: 'from-blue-600 to-blue-700',
  komfortli: 'from-green-600 to-green-700',
  premiumlar: 'from-purple-600 to-purple-700',
  krossoverlar: 'from-orange-600 to-orange-700'
}

export default function CarCard({ car }: CarCardProps) {
  const [imageError, setImageError] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="group h-full">
      <div className="relative h-full bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col">
        
        {/* Image Container */}
        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden bg-gray-950">
          {!imageError ? (
            <Image
              src={car.image || '/placeholder-car.svg'}
              alt={car.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <svg className="w-16 h-16 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-60"></div>

          {/* Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            {car.quantity > 0 && (
              <div className="px-3 py-1.5 rounded-full text-xs font-bold bg-green-500/90 text-white backdrop-blur-sm flex items-center gap-1.5">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                {car.quantity} ta
              </div>
            )}
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold text-white backdrop-blur-sm bg-gradient-to-r ${categoryColors[car.category]}`}>
              {categoryLabels[car.category]}
            </div>
          </div>

          {/* Year Badge */}
          {car.year && (
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-semibold backdrop-blur-sm">
              {car.year}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5 md:p-6 flex flex-col">
          
          {/* Title */}
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
            {car.name}
          </h3>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {car.transmission && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 bg-white/5 rounded-lg px-2.5 py-1.5 border border-white/10">
                <Cog className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="truncate">{car.transmission}</span>
              </div>
            )}
            
            {car.fuel && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 bg-white/5 rounded-lg px-2.5 py-1.5 border border-white/10">
                <Fuel className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="truncate">{car.fuel}</span>
              </div>
            )}

            {car.seats && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 bg-white/5 rounded-lg px-2.5 py-1.5 border border-white/10">
                <Users className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>{car.seats} o'rin</span>
              </div>
            )}

            {car.has_ac && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 bg-white/5 rounded-lg px-2.5 py-1.5 border border-white/10">
                <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Konditsioner</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mb-4 pb-4 border-t border-white/10">
            <p className="text-xs text-gray-400 mb-1">Kunlik narx</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              {formatPrice(car.price)}
              <span className="text-xs sm:text-sm text-gray-400 ml-1">so'm</span>
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 mt-auto">
            <Link
              href={`/cars/${car.id}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base group/btn"
            >
              <span>Batafsil</span>
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href={`/booking?car_id=${car.id}`}
              className="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-blue-500/50 text-sm sm:text-base text-center"
            >
              Bronlash
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
