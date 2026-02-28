'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Car {
  id: number
  name: string
  category: string
  price: number
  image: string
  year: number
  fuel: string
  transmission: string
  has_ac: boolean
  seats: number
  quantity: number
  available: boolean
}

export default function AdminCarsPage() {
  const router = useRouter()
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'byudjetillar',
    price: '',
    image: '',
    year: '',
    fuel: '',
    transmission: '',
    has_ac: false,
    seats: '5',
    quantity: '1'
  })

  const categoryOptions = [
    { value: 'byudjetillar', label: 'Byudjetillar' },
    { value: 'komfortli', label: 'Komfortli' },
    { value: 'premiumlar', label: 'Premiumlar' },
    { value: 'krossoverlar', label: 'Krossoverlar' }
  ]

  useEffect(() => {
    loadCars()
  }, [])

  const loadCars = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      if (!token) {
        setError('Autentifikatsiya kerak')
        return
      }
      
      const response = await fetch('http://localhost:5000/api/admin/cars', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Mashinalar yuklanmadi')
      const data = await response.json()
      setCars(data.cars || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        alert('Autentifikatsiya kerak')
        return
      }

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        year: formData.year ? parseInt(formData.year) : null,
        seats: parseInt(formData.seats),
        quantity: parseInt(formData.quantity)
      }

      const url = editingId
        ? `http://localhost:5000/api/admin/cars/${editingId}`
        : 'http://localhost:5000/api/admin/cars'
      
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Xatolik yuz berdi')

      setShowForm(false)
      setEditingId(null)
      setFormData({
        name: '',
        category: 'byudjetillar',
        price: '',
        image: '',
        year: '',
        fuel: '',
        transmission: '',
        has_ac: false,
        seats: '5',
        quantity: '1'
      })
      loadCars()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xatolik yuz berdi')
    }
  }

  const handleEdit = (car: Car) => {
    setFormData({
      name: car.name,
      category: car.category,
      price: car.price.toString(),
      image: car.image,
      year: car.year?.toString() || '',
      fuel: car.fuel,
      transmission: car.transmission,
      has_ac: car.has_ac,
      seats: car.seats.toString(),
      quantity: car.quantity.toString()
    })
    setEditingId(car.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Rostdan ham o\'chirib tashlamoqchisiz?')) return

    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        alert('Autentifikatsiya kerak')
        return
      }

      const response = await fetch(`http://localhost:5000/api/admin/cars/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('O\'chirib bo\'lmadi')
      loadCars()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xatolik yuz berdi')
    }
  }

  const categoryLabels: Record<string, string> = {
    byudjetillar: 'Byudjetillar',
    komfortli: 'Komfortli',
    premiumlar: 'Premiumlar',
    krossoverlar: 'Krossoverlar'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Mashinalar Boshqaruvi</h1>
            <p className="text-gray-400">Jami: {cars.length} ta mashinalar</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true)
              setEditingId(null)
              setFormData({
                name: '',
                category: 'byudjetillar',
                price: '',
                image: '',
                year: '',
                fuel: '',
                transmission: '',
                has_ac: false,
                seats: '5',
                quantity: '1'
              })
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
          >
            + Yangi Mashinalar
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
              <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {editingId ? 'Mashinani Tahrirlash' : 'Yangi Mashinalar Qo\'shish'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Mashinaning nomi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:border-white/50"
                  />
                  
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:border-white/50"
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Narx (so'm)"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:border-white/50"
                  />

                  <input
                    type="text"
                    placeholder="Rasm URL"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:border-white/50"
                  />

                  <input
                    type="number"
                    placeholder="Yili"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:border-white/50"
                  />

                  <input
                    type="text"
                    placeholder="Yoqilg'i (Benzin, Dizel, Gaz)"
                    value={formData.fuel}
                    onChange={(e) => setFormData({ ...formData, fuel: e.target.value })}
                    className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:border-white/50"
                  />

                  <input
                    type="text"
                    placeholder="Transmissiya (Avtomatik, Manual)"
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                    className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:border-white/50"
                  />

                  <input
                    type="number"
                    placeholder="O'rinlar soni"
                    value={formData.seats}
                    onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                    className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:border-white/50"
                  />

                  <input
                    type="number"
                    placeholder="Mavjud miqdori"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:border-white/50"
                  />
                </div>

                <label className="flex items-center gap-3 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.has_ac}
                    onChange={(e) => setFormData({ ...formData, has_ac: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span>Konditsioner bor</span>
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                  >
                    {editingId ? 'Saqlash' : 'Qo\'shish'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all"
                  >
                    Bekor qilish
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Cars Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
        ) : cars.length > 0 ? (
          <div className="overflow-x-auto bg-gray-900/50 border border-white/10 rounded-lg">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr className="text-left text-sm font-semibold text-gray-300">
                  <th className="px-6 py-4">Nomi</th>
                  <th className="px-6 py-4">Kategoriya</th>
                  <th className="px-6 py-4">Narx</th>
                  <th className="px-6 py-4">Yili</th>
                  <th className="px-6 py-4">Mavjud</th>
                  <th className="px-6 py-4">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-white">{car.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">
                        {categoryLabels[car.category]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white font-semibold">
                      {new Intl.NumberFormat('uz-UZ').format(car.price)} so'm
                    </td>
                    <td className="px-6 py-4 text-gray-400">{car.year || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        car.quantity > 0
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {car.quantity} ta
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(car)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-all"
                      >
                        Tahrirlash
                      </button>
                      <button
                        onClick={() => handleDelete(car.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-all"
                      >
                        O'chirish
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-900/50 border border-white/10 rounded-lg">
            <p className="text-gray-400 mb-4">Hali mashinalar qo'shilmagan</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              Birinchi mashinani qo'shish
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
