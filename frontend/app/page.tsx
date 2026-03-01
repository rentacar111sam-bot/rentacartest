'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import APKDownload from '@/components/APKDownload'

interface Category {
  id: number
  name: string
  slug: string
  description: string
  image: string
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${apiUrl}/categories`)
      const data = await response.json()
      setCategories(Array.isArray(data) ? data : [])
      
      // Minimum 3 sekund ko'rsatish
      await new Promise(resolve => setTimeout(resolve, 3000))
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <APKDownload />
      
      {/* Hero Section */}
      <section className="relative w-full min-h-screen sm:min-h-[120vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: 'url(/bosh%20sahifa.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          }}
        />
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 sm:bg-gradient-to-r sm:from-black/70 sm:via-black/50 sm:to-black/70"></div>
        
        {/* Content */}
        <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12 items-center min-h-screen sm:min-h-[120vh]">
            <div className="text-white py-6 sm:py-10 md:py-14 lg:py-20 flex flex-col justify-center">
              <div className="mb-4 sm:mb-5 md:mb-6">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-5 md:mb-6">
                  <span className="text-xs sm:text-sm md:text-base font-semibold text-white">✨ Eng yaxshi takliflar</span>
                </div>
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight drop-shadow-lg">
                Eng yaxshi avtomobillarni
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-white">ijaraga oling</span>
              </h1>
              
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl mb-6 sm:mb-7 md:mb-8 text-gray-100 drop-shadow max-w-lg leading-relaxed">
                Qulay narxlarda sifatli avtomobillar. Tez va ishonchli xizmat.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4">
                <Link href="/cars" className="btn-primary text-xs sm:text-sm md:text-base px-4 sm:px-5 md:px-6 lg:px-8 py-2.5 sm:py-3 md:py-3.5 lg:py-4 inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-lg font-semibold">
                  Mashinalarni ko'rish
                </Link>
                <Link href="/about" className="border-2 border-white text-white hover:bg-white hover:text-black font-semibold py-2.5 sm:py-3 md:py-3.5 lg:py-4 px-4 sm:px-5 md:px-6 lg:px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-2xl text-xs sm:text-sm md:text-base transform hover:scale-105 backdrop-blur-sm bg-white/5 hover:bg-white">
                  Biz haqimizda
                </Link>
              </div>
              
              {/* Stats Row */}
              <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-2.5 sm:p-3 md:p-4">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">150+</div>
                  <div className="text-xs sm:text-sm text-gray-300">Avtomobillar</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-2.5 sm:p-3 md:p-4">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">60K+</div>
                  <div className="text-xs sm:text-sm text-gray-300">Mijozlar</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-2.5 sm:p-3 md:p-4">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">24/7</div>
                  <div className="text-xs sm:text-sm text-gray-300">Xizmat</div>
                </div>
              </div>
            </div>
            
            <div className="relative hidden lg:flex items-center justify-center">
              {/* Dekorativ element o'rniga bo'sh joy */}
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <span className="text-xs sm:text-sm text-white/60">Pastga scroll qiling</span>
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-2">
              <div className="w-1 h-2 bg-white/60 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Catalog Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-navy-900 to-navy-800 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-4">
              <span className="text-sm font-semibold text-white">🚗 Kategoriyalar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-white">
              O'zingizga mos avtomobil toping
            </h2>
            <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto">
              Har bir kategoriyada eng yaxshi takliflar va qulay narxlar
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {loading ? (
              // Skeleton Loader
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="relative h-64 sm:h-72 md:h-80 rounded-2xl overflow-hidden bg-gray-800/50 animate-pulse"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-800/60 to-transparent"></div>
                  <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
                    <div className="h-8 bg-gray-700/50 rounded-lg mb-3 w-3/4"></div>
                    <div className="h-4 bg-gray-700/50 rounded-lg mb-2 w-full"></div>
                    <div className="h-4 bg-gray-700/50 rounded-lg mb-4 w-2/3"></div>
                    <div className="h-10 bg-gray-700/50 rounded-full w-40"></div>
                  </div>
                </div>
              ))
            ) : (
              categories.map((category, index) => (
                <Link
                  key={category.id}
                  href={`/cars?category=${category.slug}`}
                  className="group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-64 sm:h-72 md:h-80 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
                    {/* Image */}
                    <div className="absolute inset-0">
                      <Image
                        src={category.image || '/placeholder-car.svg'}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300"></div>
                    
                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
                      <div className="transform transition-all duration-300 group-hover:translate-y-0">
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 drop-shadow-lg">
                          {category.name}
                        </h3>
                        <p className="text-gray-200 text-sm mb-4 opacity-90 group-hover:opacity-100 transition-opacity line-clamp-2">
                          {category.description}
                        </p>
                        <div className="inline-flex items-center gap-2 text-white text-sm font-semibold bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 group-hover:bg-white/30 group-hover:border-white/50 transition-all">
                          Batafsil ko'rish
                          <span className="text-lg transform group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hover Border Effect */}
                    <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/40 rounded-2xl transition-all duration-300 pointer-events-none"></div>
                    
                    {/* Shine Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>


    </div>
  )
}
