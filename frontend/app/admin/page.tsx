'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { LogOut, Eye, EyeOff, Car, Calendar, Users, Settings, Plus, Edit2, Trash2, Search, Power, Menu, X } from 'lucide-react'
import { Toast } from '@/components/Toast'
import CategoriesTab from './components/CategoriesTab'

interface CarType {
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

interface BookingType {
  id: number
  booking_id: string
  car_id: number
  car_name: string
  user_name: string
  user_phone: string
  user_email: string
  start_date: string
  end_date: string
  total_price: number
  status: string
  created_at: string
  passport_front: string
  passport_back: string
  driver_license: string
  payment_receipt: string
}

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [cars, setCars] = useState<CarType[]>([])
  const [bookings, setBookings] = useState<BookingType[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [stats, setStats] = useState({
    total_cars: 0,
    total_categories: 0,
    total_bookings: 0,
    total_users: 0,
    pending_bookings: 0
  })
  
  // Modal states
  const [showAddCarModal, setShowAddCarModal] = useState(false)
  const [showEditCarModal, setShowEditCarModal] = useState(false)
  const [editingCarId, setEditingCarId] = useState<number | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  
  // Quick booking states
  const [quickBookingCar, setQuickBookingCar] = useState<number | null>(null)
  const [quickBookingStartDate, setQuickBookingStartDate] = useState('')
  const [quickBookingEndDate, setQuickBookingEndDate] = useState('')
  
  // Form states
  const [carForm, setCarForm] = useState({
    name: '',
    category: 'byudjetillar',
    price: '',
    year: new Date().getFullYear(),
    fuel: 'Benzin',
    transmission: 'Avtomatik',
    has_ac: false,
    seats: 5,
    fuel_consumption: 0,
    quantity: 1,
    image: ''
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const loadCars = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        setCars([])
        setLoading(false)
        return
      }

      const response = await fetch('http://localhost:5000/api/admin/cars', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        mode: 'cors',
        credentials: 'include'
      })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      if (data.cars && Array.isArray(data.cars)) {
        setCars(data.cars)
        setStats(prev => ({ ...prev, total_cars: data.total }))
      } else {
        setCars([])
      }
    } catch (error) {
      console.error('Error loading cars:', error)
      setCars([])
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include'
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setStats({
        total_cars: data.total_cars || 0,
        total_categories: data.total_categories || 0,
        total_bookings: data.total_bookings || 0,
        total_users: data.total_users || 0,
        pending_bookings: data.pending_bookings || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadBookings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        credentials: 'include'
      })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setBookings(data.bookings || [])
      loadStats()
    } catch (error) {
      console.error('Error loading bookings:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        credentials: 'include'
      })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Backend login endpoint ni chaqir
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          password: password
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        // JWT token ni localStorage da saqla
        localStorage.setItem('admin_token', data.access_token)
        
        setIsAuthenticated(true)
        setPassword('')
        loadCars()
        loadStats()
        loadBookings()
        loadUsers()
        setToast({ message: 'Admin paneliga xush kelibsiz!', type: 'success' })
      } else {
        setToast({ message: 'Parol noto\'g\'ri!', type: 'error' })
        setPassword('')
      }
    } catch (error) {
      console.error('Error checking password:', error)
      setToast({ message: 'Xatolik yuz berdi', type: 'error' })
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPassword('')
    setCars([])
    setBookings([])
    setUsers([])
    setStats({ total_cars: 0, total_categories: 0, total_bookings: 0, total_users: 0, pending_bookings: 0 })
    router.push('/')
  }

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!carForm.name || !carForm.price) {
      setToast({ message: 'Barcha maydonlarni to\'ldiring', type: 'error' })
      return
    }
    
    // Rasm URL ni tekshir
    if (!carForm.image || carForm.image === '') {
      setToast({ message: 'Iltimos, rasm yuklang', type: 'error' })
      return
    }
    
    console.log('Adding car with data:', {
      name: carForm.name,
      image: carForm.image,
      price: carForm.price
    })
    
    try {
      const carData = {
        name: carForm.name,
        category: carForm.category,
        price: parseInt(carForm.price),
        year: carForm.year,
        fuel: carForm.fuel,
        transmission: carForm.transmission,
        has_ac: carForm.has_ac,
        seats: carForm.seats,
        fuel_consumption: carForm.fuel_consumption,
        quantity: carForm.quantity,
        features: [],
        image: carForm.image,
        available: true
      }
      
      console.log('Sending to backend:', carData)
      
      // Token ni localStorage dan olish
      const token = localStorage.getItem('admin_token')
      console.log('Using token:', token)
      
      const response = await fetch('http://localhost:5000/api/admin/cars', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(carData)
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Backend response:', result)
        setToast({ message: 'Avtomobil qo\'shildi!', type: 'success' })
        setShowAddCarModal(false)
        resetCarForm()
        loadCars()
      } else {
        const errorData = await response.json()
        console.error('Backend error:', errorData)
        setToast({ message: 'Xatolik yuz berdi: ' + JSON.stringify(errorData), type: 'error' })
      }
    } catch (error) {
      console.error('Exception:', error)
      setToast({ message: 'Xatolik yuz berdi: ' + String(error), type: 'error' })
    }
  }

  const handleEditCar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCarId) return
    
    console.log('Editing car with image:', carForm.image)
    
    try {
      const token = localStorage.getItem('admin_token')
      
      const response = await fetch(`http://localhost:5000/api/admin/cars/${editingCarId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: carForm.name,
          category: carForm.category,
          price: parseInt(carForm.price),
          year: carForm.year,
          fuel: carForm.fuel,
          transmission: carForm.transmission,
          has_ac: carForm.has_ac,
          seats: carForm.seats,
          fuel_consumption: carForm.fuel_consumption,
          quantity: carForm.quantity,
          features: [],
          image: carForm.image || ''
        })
      })
      if (response.ok) {
        setToast({ message: 'Avtomobil tahrirlandi!', type: 'success' })
        setShowEditCarModal(false)
        setEditingCarId(null)
        resetCarForm()
        loadCars()
      } else {
        const errorData = await response.json()
        setToast({ message: 'Xatolik yuz berdi: ' + JSON.stringify(errorData), type: 'error' })
      }
    } catch (error) {
      setToast({ message: 'Xatolik yuz berdi: ' + String(error), type: 'error' })
    }
  }

  const handleDeleteCar = async (carId: number) => {
    if (!confirm('Bu avtomobilni o\'chirishni tasdiqlaysizmi?')) return
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`http://localhost:5000/api/admin/cars/${carId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        setToast({ message: 'Avtomobil o\'chirildi!', type: 'success' })
        loadCars()
      } else {
        setToast({ message: 'Xatolik yuz berdi', type: 'error' })
      }
    } catch (error) {
      setToast({ message: 'Xatolik yuz berdi', type: 'error' })
    }
  }

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (response.ok) {
        setToast({ message: `Bron ${status === 'confirmed' ? 'tasdiqlandi' : status === 'cancelled' ? 'bekor qilindi' : 'yangilandi'}`, type: 'success' })
        loadBookings()
        setShowBookingModal(false)
      } else {
        setToast({ message: 'Xatolik yuz berdi', type: 'error' })
      }
    } catch (error) {
      setToast({ message: 'Xatolik yuz berdi', type: 'error' })
    }
  }

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Bu bronni o\'chirishni tasdiqlaysizmi?')) return
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setToast({ message: 'Bron o\'chirildi!', type: 'success' })
        loadBookings()
        setShowBookingModal(false)
      } else {
        setToast({ message: 'Xatolik yuz berdi', type: 'error' })
      }
    } catch (error) {
      setToast({ message: 'Xatolik yuz berdi', type: 'error' })
    }
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setToast({ message: 'Foydalanuvchi o\'chirildi!', type: 'success' })
        loadUsers()
      } else {
        setToast({ message: 'Xatolik yuz berdi', type: 'error' })
      }
    } catch (error) {
      setToast({ message: 'Xatolik yuz berdi', type: 'error' })
    }
  }

  const handleQuickBooking = async () => {
    if (!quickBookingCar || !quickBookingStartDate || !quickBookingEndDate) {
      setToast({ message: 'Barcha maydonlarni to\'ldiring', type: 'error' })
      return
    }

    try {
      const formData = new FormData()
      formData.append('car_id', quickBookingCar.toString())
      formData.append('first_name', 'Admin')
      formData.append('last_name', 'Bron')
      formData.append('phone', '+998901234567')
      formData.append('email', 'admin@rentcar.uz')
      formData.append('start_date', quickBookingStartDate)
      formData.append('end_date', quickBookingEndDate)
      formData.append('is_admin', 'true')

      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setToast({ message: `Bron qilindi! ID: ${data.booking_id}`, type: 'success' })
        setQuickBookingCar(null)
        setQuickBookingStartDate('')
        setQuickBookingEndDate('')
        loadBookings()
      } else {
        const error = await response.json()
        setToast({ message: error.error || 'Xatolik yuz berdi', type: 'error' })
      }
    } catch (error) {
      console.error('Error:', error)
      setToast({ message: 'Xatolik yuz berdi', type: 'error' })
    }
  }

  const resetCarForm = () => {
    setCarForm({
      name: '',
      category: 'byudjetillar',
      price: '',
      year: new Date().getFullYear(),
      fuel: 'Benzin',
      transmission: 'Avtomatik',
      has_ac: false,
      seats: 5,
      fuel_consumption: 0,
      quantity: 1,
      image: ''
    })
    setImagePreview(null)
  }

  const openEditCarModal = (car: CarType) => {
    setEditingCarId(car.id)
    setCarForm({
      name: car.name,
      category: car.category,
      price: car.price.toString(),
      year: car.year,
      fuel: car.fuel,
      transmission: car.transmission,
      has_ac: car.has_ac,
      seats: car.seats,
      fuel_consumption: car.fuel_consumption,
      quantity: car.quantity,
      image: car.image
    })
    setImagePreview(car.image)
    setShowEditCarModal(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    const formData = new FormData()
    formData.append('file', file)

    try {
      console.log('Uploading file:', file.name)
      
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
      })
      
      console.log('Upload response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Upload response:', data)
        console.log('Image URL:', data.url)
        
        setCarForm(prevForm => {
          const updated = { ...prevForm, image: data.url }
          console.log('Updated carForm with image:', updated.image)
          return updated
        })
        
        setToast({ message: 'Rasm yuklandi: ' + data.url, type: 'success' })
      } else {
        const errorText = await response.text()
        console.error('Upload error response:', errorText)
        setToast({ message: 'Rasm yuklashda xatolik: ' + errorText, type: 'error' })
      }
    } catch (error) {
      console.error('Upload exception:', error)
      setToast({ message: 'Rasm yuklashda xatolik: ' + String(error), type: 'error' })
    }
  }

  const filteredCars = cars.filter(car => {
    const matchesSearch = car.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || car.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000619] via-[#001122] to-[#000619] flex items-center justify-center">
        <div className="text-white">Yuklanmoqda...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000619] via-[#001122] to-[#000619] flex">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 z-10"></div>
          <Image
            src="/bosh sahifa.jpg"
            alt="RentCar"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute bottom-0 left-0 right-0 p-12 z-20 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-4 mb-4">
              <Image
                src="/logo.png"
                alt="Logo"
                width={60}
                height={60}
                className="rounded-xl"
              />
              <div>
                <h2 className="text-3xl font-bold text-white">RentCar</h2>
                <p className="text-gray-300">Premium avtomobil ijarasi</p>
              </div>
            </div>
            <p className="text-gray-300 text-lg">
              Eng yaxshi avtomobillar, eng qulay narxlarda. Bizning boshqaruv panelimizga xush kelibsiz!
            </p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="w-full max-w-sm md:max-w-md">
            <div className="lg:hidden text-center mb-6 sm:mb-8">
              <Image
                src="/logo.png"
                alt="RentCar"
                width={56}
                height={56}
                className="rounded-lg mx-auto mb-3 sm:mb-4"
              />
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5 sm:mb-2">Admin Panel</h1>
              <p className="text-gray-400 text-xs sm:text-sm">RentCar boshqaruv paneli</p>
            </div>

            <div className="hidden lg:block mb-6 sm:mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-1.5 sm:mb-2">Xush kelibsiz!</h1>
              <p className="text-gray-400 text-base md:text-lg">Admin paneliga kirish uchun parolni kiriting</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-white/20">
              <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5 md:space-y-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                    Parol
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm md:text-base"
                      placeholder="Parolni kiriting..."
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} className="sm:w-5 sm:h-5" /> : <Eye size={16} className="sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl text-xs sm:text-sm md:text-base"
                >
                  Kirish
                </button>
              </form>

              <div className="mt-4 sm:mt-5 md:mt-6 text-center">
                <p className="text-gray-500 text-xs sm:text-sm">
                  
                </p>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-gray-500 text-xs sm:text-sm">
                © 2026 RentCar. Barcha huquqlar himoyalangan.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000619] via-[#001122] to-[#000619] flex relative overflow-hidden">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed lg:relative top-0 left-0 h-screen bg-[#0a0e1a] border-r border-white/10 transition-all duration-300 z-50 ${
        sidebarOpen ? 'w-56 sm:w-64' : 'w-0 lg:w-64'
      } overflow-hidden flex flex-col`}>
        <div className="p-4 sm:p-5 md:p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="RentCar"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <div>
              <h2 className="text-white font-bold text-base sm:text-lg">RentCar</h2>
              <p className="text-gray-400 text-xs">Boshqaruv paneli</p>
            </div>
          </div>

          <nav className="space-y-1.5 sm:space-y-2 flex-1">
            {[
              { id: 'dashboard', label: 'Bosh sahifa', icon: '📊' },
              { id: 'quick-booking', label: 'Tez Bron', icon: '⚡' },
              { id: 'cars', label: 'Avtomobillar', icon: '🚗' },
              { id: 'categories', label: 'Kategoriyalar', icon: '📂' },
              { id: 'bookings', label: 'Bronlar', icon: '📅' },
              { id: 'messages', label: 'Xabarlar', icon: '💬' },
              { id: 'users', label: 'Foydalanuvchilar', icon: '👥' },
              { id: 'settings', label: 'Sozlamalar', icon: '⚙️' }
            ].map((item: any) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.link) {
                    router.push(item.link)
                  } else {
                    setActiveTab(item.id)
                    if (window.innerWidth < 1024) setSidebarOpen(false)
                  }
                }}
                className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all text-xs sm:text-sm md:text-base ${
                  activeTab === item.id
                    ? 'bg-white text-[#0a0e1a] font-semibold'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-sm sm:text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="pt-4 sm:pt-5 md:pt-6 border-t border-white/10 space-y-1.5 sm:space-y-2 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-gray-400 hover:bg-red-500/20 hover:text-red-300 transition-all text-xs sm:text-sm md:text-base"
            >
              <Power className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Chiqish</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <div className="bg-[#0a0e1a]/80 backdrop-blur-sm border-b border-white/10 flex-shrink-0">
          <div className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-400 hover:text-white lg:hidden"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  {activeTab === 'dashboard' && 'Bosh sahifa'}
                  {activeTab === 'quick-booking' && 'Tez Bron'}
                  {activeTab === 'cars' && 'Avtomobillar'}
                  {activeTab === 'categories' && 'Kategoriyalar'}
                  {activeTab === 'bookings' && 'Bronlar'}
                  {activeTab === 'messages' && 'Xabarlar'}
                  {activeTab === 'users' && 'Foydalanuvchilar'}
                  {activeTab === 'settings' && 'Sozlamalar'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-400">
                  {activeTab === 'dashboard' && 'Umumiy statistika va ma\'lumotlar'}
                  {activeTab === 'quick-booking' && 'Tez bron qilish'}
                  {activeTab === 'cars' && 'Barcha avtomobillarni boshqaring'}
                  {activeTab === 'categories' && 'Barcha kategoriyalarni boshqaring'}
                  {activeTab === 'bookings' && 'Barcha bronlarni boshqaring'}
                  {activeTab === 'messages' && 'Aloqa bo\'limidan kelgan xabarlar'}
                  {activeTab === 'users' && 'Barcha foydalanuvchilarni boshqaring'}
                  {activeTab === 'settings' && 'Admin panel sozlamalarini boshqaring'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 sm:gap-2 bg-red-600 hover:bg-red-700 text-white px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm md:text-base"
            >
              <LogOut size={16} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 lg:p-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-6 sm:mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 text-white">
                  <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Car className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold">{stats.total_cars}</span>
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold">Avtomobillar</h3>
                  <p className="text-xs sm:text-sm text-blue-100">Jami mavjud</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 text-white">
                  <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold">{stats.total_bookings}</span>
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold">Bronlar</h3>
                  <p className="text-xs sm:text-sm text-green-100">Jami bronlar</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 text-white">
                  <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold">{stats.total_users}</span>
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold">Foydalanuvchilar</h3>
                  <p className="text-xs sm:text-sm text-purple-100">Ro'yxatdan o'tgan</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Booking Tab */}
          {activeTab === 'quick-booking' && (
            <div className="max-w-2xl">
              <div className="bg-[#0a0e1a] border border-white/10 rounded-2xl p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Tez Bron Qilish</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Avtomobil Tanlang</label>
                    <select
                      value={quickBookingCar || ''}
                      onChange={(e) => setQuickBookingCar(parseInt(e.target.value) || null)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-white focus:border-transparent outline-none"
                    >
                      <option value="">-- Avtomobil tanlang --</option>
                      {cars.map(car => (
                        <option key={car.id} value={car.id}>
                          {car.name} - {car.price.toLocaleString()} so'm
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Boshlanish Sanasi</label>
                      <input
                        type="date"
                        value={quickBookingStartDate}
                        onChange={(e) => setQuickBookingStartDate(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-white focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Tugash Sanasi</label>
                      <input
                        type="date"
                        value={quickBookingEndDate}
                        onChange={(e) => setQuickBookingEndDate(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-white focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleQuickBooking}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    ⚡ Tez Bron Qilish
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cars Tab */}
          {activeTab === 'cars' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-[#0a0e1a] border border-white/10 rounded-2xl p-4 sm:p-6 sticky top-24">
                  <button
                    onClick={() => {
                      resetCarForm()
                      setShowAddCarModal(true)
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-[#0a0e1a] font-bold py-3 rounded-lg transition-all mb-6"
                  >
                    <Plus className="w-4 h-4" />
                    Yangi avtomobil
                  </button>

                  <h2 className="text-lg font-bold text-white mb-6">Filtrlash</h2>
                  
                  <div className="mb-6">
                    <label className="block text-sm text-gray-400 mb-2">Qidirish</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Avtomobil nomi..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm text-gray-400 mb-3">Kategoriya</label>
                    <div className="space-y-2">
                      {[
                        { value: 'all', label: 'Barchasi' },
                        { value: 'byudjetillar', label: '1️⃣ Byudjetillar' },
                        { value: 'komfortli', label: '2️⃣ Komfortli' },
                        { value: 'premiumlar', label: '3️⃣ Premiumlar' },
                        { value: 'krossoverlar', label: '4️⃣ Krossoverlar' }
                      ].map((cat) => (
                        <label key={cat.value} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name="category"
                            value={cat.value}
                            checked={selectedCategory === cat.value}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-4 h-4 accent-white"
                          />
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                            {cat.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3">
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400">Yuklanmoqda...</p>
                  </div>
                ) : filteredCars.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400">Avtomobillar topilmadi</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {filteredCars.map((car) => (
                      <div key={car.id} className="group bg-[#0a0e1a] border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all">
                        <div className="relative h-48 bg-gradient-to-br from-white/5 to-white/10">
                          <Image
                            src={car.image || '/logo.png'}
                            alt={car.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-3 right-3 bg-white text-[#0a0e1a] px-4 py-2 rounded-full text-sm font-bold">
                            {car.price.toLocaleString()} so'm
                          </div>
                        </div>

                        <div className="p-4 sm:p-5">
                          <h3 className="text-lg font-bold text-white mb-2">{car.name}</h3>
                          <div className="text-sm text-gray-400 mb-4">
                            <p className="capitalize">{car.category}</p>
                            <p>{car.year} yil</p>
                          </div>

                          <div className="space-y-1 mb-4 text-xs text-gray-300">
                            <div className="flex items-center">
                              <span className="w-1.5 h-1.5 bg-white rounded-full mr-2"></span>
                              {car.has_ac ? '✓ Tanirofkali' : '✗ Tanirofkasiz'}
                            </div>
                            <div className="flex items-center">
                              <span className="w-1.5 h-1.5 bg-white rounded-full mr-2"></span>
                              O'rindiqi: {car.seats} ta
                            </div>
                            {car.fuel_consumption > 0 && (
                              <div className="flex items-center">
                                <span className="w-1.5 h-1.5 bg-white rounded-full mr-2"></span>
                                100 kmga: {car.fuel_consumption} litr
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditCarModal(car)}
                              className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-lg transition-all text-sm"
                            >
                              <Edit2 className="w-4 h-4" />
                              Tahrirlash
                            </button>
                            <button
                              onClick={() => handleDeleteCar(car.id)}
                              className="flex-1 flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 py-2.5 rounded-lg transition-all text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                              O'chirish
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div>
              <div className="mb-6 flex items-center justify-end">
                <button
                  onClick={() => loadBookings()}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all"
                >
                  🔄 Yangilash
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Bronlar topilmadi</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-[#0a0e1a] border border-white/10 rounded-xl p-4 sm:p-6 hover:border-white/30 transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedBooking(booking)
                        setShowBookingModal(true)
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-bold text-white">{booking.car_name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                              booking.status === 'confirmed' ? 'bg-green-500/20 text-green-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {booking.status === 'pending' ? 'Kutilmoqda' : 
                               booking.status === 'confirmed' ? 'Tasdiqlandi' : 'Bekor qilingan'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                            <div>� {booking.user_name}</div>
                            <div>�📞 {booking.user_phone}</div>
                            <div>📅 {new Date(booking.start_date).toLocaleDateString('uz-UZ')}</div>
                            <div>💰 {(booking.total_price || 0).toLocaleString()} so'm</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder="Ism, telefon yoki email bo'yicha qidirish..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:border-transparent outline-none"
                  />
                </div>
                <button
                  onClick={() => loadUsers()}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all whitespace-nowrap"
                >
                  🔄 Yangilash
                </button>
              </div>

              {users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Foydalanuvchilar topilmadi</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {users
                    .filter(user =>
                      userSearchTerm === '' ||
                      user.first_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      user.last_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      user.phone?.includes(userSearchTerm) ||
                      user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
                    )
                    .map((user) => (
                      <div
                        key={user.id}
                        className="bg-[#0a0e1a] border border-white/10 rounded-xl p-4 sm:p-6 hover:border-white/30 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-bold text-white">{user.first_name} {user.last_name}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                user.status === 'vip' ? 'bg-purple-500/20 text-purple-300' :
                                user.status === 'regular' ? 'bg-blue-500/20 text-blue-300' :
                                'bg-gray-500/20 text-gray-300'
                              }`}>
                                {user.status_text}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-300 mb-3">
                              <div>📞 {user.phone}</div>
                              <div>📧 {user.email}</div>
                              <div>🚗 Bronlar: {user.booking_count}</div>
                              {user.last_booking_date && (
                                <div className="col-span-2 sm:col-span-3">📅 Oxirgi bron: {new Date(user.last_booking_date).toLocaleDateString('uz-UZ')}</div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (confirm(`${user.first_name} ${user.last_name} ni o'chirishni tasdiqlaysizmi?`)) {
                                handleDeleteUser(user.id)
                              }
                            }}
                            className="bg-red-600/20 hover:bg-red-600/40 text-red-300 px-4 py-2 rounded-lg transition-all text-sm whitespace-nowrap"
                          >
                            🗑️ O'chirish
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <CategoriesTab />
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* System Stats */}
              <div className="bg-[#0a0e1a] border border-white/10 rounded-2xl p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Tizim Ma'lumotlari</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Avtomobillar</p>
                    <p className="text-2xl font-bold text-white">{stats.total_cars}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Foydalanuvchilar</p>
                    <p className="text-2xl font-bold text-white">{stats.total_users}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Jami Bronlar</p>
                    <p className="text-2xl font-bold text-white">{stats.total_bookings}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Kutilayotgan Bronlar</p>
                    <p className="text-2xl font-bold text-white">{stats.pending_bookings}</p>
                  </div>
                </div>
              </div>

              {/* Home Page Image */}
              <div className="bg-[#0a0e1a] border border-white/10 rounded-2xl p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Bosh Sahifa Rasmi</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Rasm Yuklash</label>
                    <input
                      type="file"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return

                        const formData = new FormData()
                        formData.append('file', file)

                        try {
                          const response = await fetch('http://localhost:5000/api/upload', {
                            method: 'POST',
                            body: formData
                          })
                          
                          if (response.ok) {
                            const data = await response.json()
                            // Save the image URL to settings
                            const settingsResponse = await fetch('http://localhost:5000/api/admin/settings', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                home_image: data.url
                              })
                            })
                            if (settingsResponse.ok) {
                              setToast({ message: 'Bosh sahifa rasmi saqlandi!', type: 'success' })
                            } else {
                              setToast({ message: 'Xatolik yuz berdi', type: 'error' })
                            }
                          } else {
                            setToast({ message: 'Rasm yuklashda xatolik', type: 'error' })
                          }
                        } catch (error) {
                          setToast({ message: 'Rasm yuklashda xatolik', type: 'error' })
                        }
                      }}
                      accept="image/*"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:border-transparent outline-none"
                    />
                    <p className="text-xs text-gray-400 mt-2">JPG, PNG, GIF formatida rasm yuklang</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Car Modal */}
      {(showAddCarModal || showEditCarModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0a0e1a] border border-white/10 rounded-2xl w-full max-w-2xl my-4">
            <div className="sticky top-0 bg-[#0a0e1a] border-b border-white/10 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {showEditCarModal ? 'Avtomobilni tahrirlash' : 'Yangi avtomobil qo\'shish'}
              </h2>
              <button
                onClick={() => {
                  setShowAddCarModal(false)
                  setShowEditCarModal(false)
                  setEditingCarId(null)
                  resetCarForm()
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={showEditCarModal ? handleEditCar : handleAddCar} className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Rasm</label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                    id="car-image"
                  />
                  <label
                    htmlFor="car-image"
                    className="flex items-center justify-center gap-2 border-2 border-dashed border-white/20 rounded-lg p-6 cursor-pointer hover:border-white/40 transition-colors"
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-40">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-gray-400 mb-2 text-2xl">📸</div>
                        <span className="text-sm text-gray-300">Rasmni tanlang</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Avtomobil nomi</label>
                <input
                  type="text"
                  value={carForm.name}
                  onChange={(e) => setCarForm({...carForm, name: e.target.value})}
                  placeholder="Masalan: Toyota Camry"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:border-transparent outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Kategoriya</label>
                  <select
                    value={carForm.category}
                    onChange={(e) => setCarForm({...carForm, category: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-white focus:border-transparent outline-none"
                  >
                    <option value="byudjetillar">1️⃣ Byudjetillar</option>
                    <option value="komfortli">2️⃣ Komfortli</option>
                    <option value="premiumlar">3️⃣ Premiumlar</option>
                    <option value="krossoverlar">4️⃣ Krossoverlar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Narx (so'm)</label>
                  <input
                    type="number"
                    value={carForm.price}
                    onChange={(e) => setCarForm({...carForm, price: e.target.value})}
                    placeholder="150000"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Yil</label>
                  <input
                    type="number"
                    value={carForm.year}
                    onChange={(e) => setCarForm({...carForm, year: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-white focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Yoqilg'i</label>
                  <select
                    value={carForm.fuel}
                    onChange={(e) => setCarForm({...carForm, fuel: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-white focus:border-transparent outline-none"
                  >
                    <option value="Benzin">Benzin</option>
                    <option value="Dizel">Dizel</option>
                    <option value="Gaz">Gaz</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Transmissiya</label>
                  <select
                    value={carForm.transmission}
                    onChange={(e) => setCarForm({...carForm, transmission: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-white focus:border-transparent outline-none"
                  >
                    <option value="Avtomatik">Avtomatik</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={carForm.has_ac}
                      onChange={(e) => setCarForm({...carForm, has_ac: e.target.checked})}
                      className="w-5 h-5 accent-white"
                    />
                    <span className="text-sm font-medium text-gray-300">Tanirofkali (Konditsioner)</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">O'rindiqi (nechta)</label>
                  <input
                    type="number"
                    value={carForm.seats}
                    onChange={(e) => setCarForm({...carForm, seats: parseInt(e.target.value) || 5})}
                    min="1"
                    max="10"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-white focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">100 kmga benzin ketishi (litr)</label>
                <input
                  type="number"
                  value={carForm.fuel_consumption}
                  onChange={(e) => setCarForm({...carForm, fuel_consumption: parseFloat(e.target.value) || 0})}
                  step="0.1"
                  min="0"
                  placeholder="Masalan: 8.5"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Avtomobil Soni</label>
                <input
                  type="number"
                  value={carForm.quantity}
                  onChange={(e) => setCarForm({...carForm, quantity: parseInt(e.target.value) || 1})}
                  min="1"
                  max="100"
                  placeholder="Masalan: 5"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  {showEditCarModal ? 'Saqlash' : 'Qo\'shish'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCarModal(false)
                    setShowEditCarModal(false)
                    setEditingCarId(null)
                    resetCarForm()
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-lg font-semibold transition-all"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#0a0e1a] border border-white/10 rounded-lg sm:rounded-xl md:rounded-2xl w-full max-w-sm sm:max-w-md md:max-w-2xl my-4">
            <div className="sticky top-0 bg-[#0a0e1a] border-b border-white/10 p-4 sm:p-5 md:p-6 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Bron ma'lumotlari</h2>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-white text-xl sm:text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-0.5 sm:mb-1">Avtomobil</p>
                  <p className="text-white font-semibold text-xs sm:text-sm md:text-base">{selectedBooking.car_name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-0.5 sm:mb-1">Holati</p>
                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium inline-block ${
                    selectedBooking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                    selectedBooking.status === 'confirmed' ? 'bg-green-500/20 text-green-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {selectedBooking.status === 'pending' ? 'Kutilmoqda' : 
                     selectedBooking.status === 'confirmed' ? 'Tasdiqlandi' : 'Bekor qilingan'}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-0.5 sm:mb-1">Foydalanuvchi</p>
                  <p className="text-white font-semibold text-xs sm:text-sm md:text-base">{selectedBooking.user_name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-0.5 sm:mb-1">Telefon</p>
                  <p className="text-white font-semibold text-xs sm:text-sm md:text-base">{selectedBooking.user_phone}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-0.5 sm:mb-1">Boshlanish sanasi</p>
                  <p className="text-white font-semibold text-xs sm:text-sm md:text-base">{new Date(selectedBooking.start_date).toLocaleDateString('uz-UZ')}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-0.5 sm:mb-1">Tugash sanasi</p>
                  <p className="text-white font-semibold text-xs sm:text-sm md:text-base">{new Date(selectedBooking.end_date).toLocaleDateString('uz-UZ')}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-0.5 sm:mb-1">Jami narx</p>
                  <p className="text-white font-semibold text-xs sm:text-sm md:text-base">{(selectedBooking.total_price || 0).toLocaleString()} so'm</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-0.5 sm:mb-1">Email</p>
                  <p className="text-white font-semibold text-xs sm:text-sm md:text-base break-all">{selectedBooking.user_email}</p>
                </div>
              </div>

              {selectedBooking.status === 'pending' && (
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => handleUpdateBookingStatus(selectedBooking.booking_id, 'confirmed')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 md:px-6 rounded-lg font-semibold transition-all text-xs sm:text-sm md:text-base"
                  >
                    ✓ Tasdiqlash
                  </button>
                  <button
                    onClick={() => handleUpdateBookingStatus(selectedBooking.booking_id, 'cancelled')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 md:px-6 rounded-lg font-semibold transition-all text-xs sm:text-sm md:text-base"
                  >
                    ✗ Bekor qilish
                  </button>
                </div>
              )}

              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => handleDeleteBooking(selectedBooking.booking_id)}
                  className="flex-1 bg-red-600/20 hover:bg-red-600/40 text-red-300 py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 md:px-6 rounded-lg font-semibold transition-all text-xs sm:text-sm md:text-base"
                >
                  🗑️ O'chirish
                </button>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 md:px-6 rounded-lg font-semibold transition-all text-xs sm:text-sm md:text-base"
                >
                  Yopish
                </button>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-blue-300">
                <p className="font-semibold mb-1">ℹ️ Hujjatlar</p>
                <p>Pasport va to'lov cheki rasmlar Telegram orqali admin ga yuboriladi</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
