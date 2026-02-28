'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import CarCard from '@/components/CarCard'

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

interface CarsResponse {
  cars: Car[]
  total: number
  page: number
  per_page: number
  pages: number
}

const categories = [
  { value: 'byudjetillar', label: 'Byudjetillar' },
  { value: 'komfortli', label: 'Komfortli' },
  { value: 'premiumlar', label: 'Premiumlar' },
  { value: 'krossoverlar', label: 'Krossoverlar' }
]

const priceRanges = [
  { value: 'low', label: '150,000 so\'mdan kam' },
  { value: 'medium', label: '150,000 - 250,000 so\'m' },
  { value: 'high', label: '250,000 so\'mdan ko\'p' }
]

export default function CarsPage() {
  const searchParams = useSearchParams()
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    price_range: '',
    search: ''
  })

  useEffect(() => {
    loadCars()
  }, [filters, page])

  const loadCars = async () => {
    try {
      setLoading(true)
      setError('')
      
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      if (filters.price_range) params.append('price_range', filters.price_range)
      if (filters.search) params.append('search', filters.search)
      params.append('page', page.toString())
      params.append('per_page', '12')

      const response = await fetch(`http://localhost:5000/api/cars?${params}`)
      
      if (!response.ok) {
        throw new Error('Mashinalar yuklanmadi')
      }

      const data: CarsResponse = await response.json()
      setCars(data.cars || [])
      setTotalPages(data.pages || 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi')
      setCars([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }))
    setPage(1)
  }

  const handleReset = () => {
    setFilters({ category: '', price_range: '', search: '' })
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800">
      <Navbar />

      {/* Header Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 border-b border-white/10">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
              Mashinalar
            </h1>
            <p className="text-gray-300 text-sm md:text-base">
              O'zingizga mos avtomobilni tanlang
            </p>
          </div>

          {/* Filters and Search */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Qidirish..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all"
              />
              <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>



            {/* Active Filters and Reset */}
            {(filters.search) && (
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {filters.search && (
                    <span className="px-3 py-1 bg-blue-600/20 border border-blue-600/50 text-blue-300 rounded-full text-sm">
                      Qidiruv: {filters.search}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleReset}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Tozalash
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-12 md:py-16">
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          // Skeleton Loader
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-700/50"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-700/50 rounded mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : cars.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
                >
                  Oldingi
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  const pageNum = i + 1
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 rounded-lg transition-all ${
                        page === pageNum
                          ? 'bg-white text-navy-900 font-semibold'
                          : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
                >
                  Keyingi
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Mashinalar topilmadi
            </h3>
            <p className="text-gray-400 mb-6">
              Boshqa filtrlari sinab ko'ring yoki qidiruv so'zini o'zgartiring
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-white text-navy-900 rounded-lg font-semibold hover:bg-gray-100 transition-all"
            >
              Filtrlashni tozalash
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
