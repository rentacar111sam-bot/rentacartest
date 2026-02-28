'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FilterProps {
  filters: {
    category: string
    price_range: string
    search: string
  }
  onFilterChange: (filters: any) => void
}

const categories = [
  { value: '', label: 'Barcha kategoriyalar', icon: '📋' },
  { value: 'byudjetillar', label: 'Byudjetillar', icon: '1️⃣' },
  { value: 'komfortli', label: 'Komfortli', icon: '2️⃣' },
  { value: 'premiumlar', label: 'Premiumlar', icon: '3️⃣' },
  { value: 'krossoverlar', label: 'Krossoverlar', icon: '4️⃣' }
]

const priceRanges = [
  { value: '', label: 'Barcha narxlar' },
  { value: 'low', label: '500,000 so\'mdan kam' },
  { value: 'medium', label: '500,000 - 1000,000 so\'m' },
  { value: 'high', label: '1000,000 so\'mdan ko\'p' }
]

export default function CarFilter({ filters, onFilterChange }: FilterProps) {
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [priceOpen, setPriceOpen] = useState(false)

  const handleCategoryChange = (category: string) => {
    onFilterChange({
      ...filters,
      category
    })
    setCategoryOpen(false)
  }

  const handlePriceChange = (priceRange: string) => {
    onFilterChange({
      ...filters,
      price_range: priceRange
    })
    setPriceOpen(false)
  }

  const handleReset = () => {
    onFilterChange({
      category: '',
      price_range: '',
      search: ''
    })
  }

  const selectedCategory = categories.find(c => c.value === filters.category)
  const selectedPrice = priceRanges.find(p => p.value === filters.price_range)

  return (
    <div className="space-y-4">
      {/* Category Dropdown */}
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-300 mb-2">Kategoriya</label>
        <button
          onClick={() => setCategoryOpen(!categoryOpen)}
          className="w-full px-4 py-3 bg-gradient-to-r from-gray-800/80 to-gray-900/80 border border-white/20 hover:border-white/40 text-white rounded-lg font-semibold transition-all flex items-center justify-between group"
        >
          <span className="flex items-center gap-2">
            <span>{selectedCategory?.icon}</span>
            {selectedCategory?.label}
          </span>
          <ChevronDown className={`w-5 h-5 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {categoryOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-br from-gray-800 to-gray-900 border border-white/20 rounded-lg shadow-2xl z-50 overflow-hidden">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all ${
                  filters.category === cat.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="font-medium">{cat.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price Dropdown */}
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-300 mb-2">Narx</label>
        <button
          onClick={() => setPriceOpen(!priceOpen)}
          className="w-full px-4 py-3 bg-gradient-to-r from-gray-800/80 to-gray-900/80 border border-white/20 hover:border-white/40 text-white rounded-lg font-semibold transition-all flex items-center justify-between group"
        >
          <span>{selectedPrice?.label}</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${priceOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {priceOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-br from-gray-800 to-gray-900 border border-white/20 rounded-lg shadow-2xl z-50 overflow-hidden">
            {priceRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => handlePriceChange(range.value)}
                className={`w-full px-4 py-3 text-left transition-all ${
                  filters.price_range === range.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reset Button */}
      {(filters.category || filters.price_range) && (
        <button
          onClick={handleReset}
          className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-gray-300 hover:text-white rounded-lg transition-all text-sm font-medium"
        >
          Filtrlashni tozalash
        </button>
      )}
    </div>
  )
}
