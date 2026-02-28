'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, LogOut, Edit2, Save, Car, Camera, Menu, Home, Settings, History, Eye, EyeOff, Lock } from 'lucide-react'
import { Toast } from '@/components/Toast'
import Image from 'next/image'

interface UserProfile {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string
  bio: string
  profile_image: string | null
  created_at: string
}

interface Booking {
  id: number
  booking_id: string
  car_name: string
  start_date: string
  end_date: string
  total_amount: number
  status: string
  created_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  })

  const [passwordData, setPasswordData] = useState({
    new_password: '',
    confirm_password: ''
  })

  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  })

  const [phoneValue, setPhoneValue] = useState<string>('')
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }
    
    fetchProfile()
    fetchBookings()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('access_token')
      console.log('Token from localStorage:', token)
      
      if (!token) {
        console.log('No token found')
        setLoading(false)
        return
      }

      console.log('Fetching profile with token...')
      const response = await fetch('http://localhost:5000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Profile response status:', response.status)

      if (!response.ok) {
        console.error('Profile fetch failed:', response.status)
        if (response.status === 401 || response.status === 422) {
          console.log('Unauthorized, clearing token')
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
        }
        setLoading(false)
        return
      }

      const data = await response.json()
      console.log('Profile data:', data)
      setUser(data.user)
      
      // Extract phone digits
      const phone = data.user.phone || ''
      const digits = phone.replace('+998', '')
      setPhoneValue(digits)
      
      setFormData({
        first_name: data.user.first_name || '',
        last_name: data.user.last_name || '',
        phone: phone
      })
      
      if (data.user.profile_image) {
        setPreviewImage(data.user.profile_image)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setToast({ message: 'Profil yuklashda xatolik', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:5000/api/user/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 9) {
      setPhoneValue(value)
      setFormData(prev => ({ ...prev, phone: '+998' + value }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfileImage(file)
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  const handleSaveProfile = async () => {
    if (phoneValue.length !== 9) {
      setToast({ message: 'Telefon raqam 9 ta raqamdan iborat bo\'lishi kerak', type: 'error' })
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('access_token')
      
      // Upload profile image if changed
      let imageUrl = user?.profile_image
      if (profileImage) {
        const formData = new FormData()
        formData.append('file', profileImage)
        
        const uploadResponse = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          imageUrl = uploadData.url
        }
      }

      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          profile_image: imageUrl
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setToast({ message: data.error || 'Xatolik yuz berdi', type: 'error' })
        return
      }

      // Update user in state and localStorage
      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      setIsEditing(false)
      setProfileImage(null)
      setToast({ message: 'Profil yangilandi', type: 'success' })
    } catch (error) {
      console.error('Error saving profile:', error)
      setToast({ message: 'Xatolik yuz berdi', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!passwordData.new_password || !passwordData.confirm_password) {
      setToast({ message: 'Barcha maydonlarni to\'ldiring', type: 'error' })
      return
    }

    if (passwordData.new_password.length < 6) {
      setToast({ message: 'Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak', type: 'error' })
      return
    }

    if (!/[a-zA-Z]/.test(passwordData.new_password) || !/[0-9]/.test(passwordData.new_password)) {
      setToast({ message: 'Parol harflar va raqamlardan iborat bo\'lishi kerak', type: 'error' })
      return
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setToast({ message: 'Parollar mos kelmayapti', type: 'error' })
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:5000/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          new_password: passwordData.new_password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setToast({ message: data.error || 'Xatolik yuz berdi', type: 'error' })
        return
      }

      setPasswordData({ new_password: '', confirm_password: '' })
      setToast({ message: 'Parol muvaffaqiyatli o\'zgartirildi', type: 'success' })
    } catch (error) {
      console.error('Error changing password:', error)
      setToast({ message: 'Xatolik yuz berdi', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const getUserStatus = () => {
    if (!bookings.length) return { text: 'Yangi mijoz', icon: '🆕', color: 'text-blue-400' }
    if (bookings.length >= 5) return { text: 'Doimiy mijoz', icon: '⭐', color: 'text-yellow-400' }
    return { text: 'Oddiy mijoz', icon: '👤', color: 'text-gray-400' }
  }

  const getLastBookingDate = () => {
    if (!bookings.length) return '-'
    const lastBooking = bookings[0]
    return new Date(lastBooking.created_at).toLocaleDateString('uz-UZ')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800 flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Yuklanimoqda...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800 flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white mb-4 text-lg">Profil ko'rish uchun avval kiring</p>
            <Link href="/auth" className="btn-primary">
              Kiring yoki Ro'yxatdan o'ting
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const status = getUserStatus()

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed lg:relative top-0 left-0 h-screen bg-[#0a0e1a] border-r border-white/10 transition-all duration-300 z-50 ${
        sidebarOpen ? 'w-64' : 'w-0 lg:w-64'
      } overflow-hidden flex flex-col`}>
        <div className="p-6 flex-shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <Image
              src="/logo.png"
              alt="RentCar"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div>
              <h2 className="text-white font-bold text-lg">RentCar</h2>
              <p className="text-gray-400 text-xs">Profil</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 flex-1 overflow-y-auto">
            <button
              onClick={() => {
                setActiveTab('profile')
                if (window.innerWidth < 1024) setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'profile'
                  ? 'bg-white text-[#0a0e1a] font-semibold'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Profil</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('bookings')
                if (window.innerWidth < 1024) setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'bookings'
                  ? 'bg-white text-[#0a0e1a] font-semibold'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <History className="w-5 h-5" />
              <span>Bronlar tarixi</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('settings')
                if (window.innerWidth < 1024) setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'settings'
                  ? 'bg-white text-[#0a0e1a] font-semibold'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Sozlamalar</span>
            </button>

            <Link
              href="/"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-all"
            >
              <Home className="w-5 h-5" />
              <span>Bosh sahifa</span>
            </Link>
          </nav>

          {/* Bottom Actions */}
          <div className="pt-6 border-t border-white/10 space-y-2 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Chiqish</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Top Bar */}
        <div className="bg-[#0a0e1a]/80 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-400 hover:text-white lg:hidden"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {activeTab === 'profile' && 'Mening Profilim'}
                  {activeTab === 'bookings' && 'Bronlar tarixi'}
                  {activeTab === 'settings' && 'Sozlamalar'}
                </h1>
                <p className="text-sm text-gray-400">
                  {activeTab === 'profile' && 'Shaxsiy ma\'lumotlaringiz'}
                  {activeTab === 'bookings' && 'Barcha bronlaringiz'}
                  {activeTab === 'settings' && 'Akkaunt sozlamalari'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="p-4 sm:p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <>
                {/* Profile Card */}
                <div className="card p-4 sm:p-5 md:p-6 lg:p-8 mb-4 sm:mb-5 md:mb-6">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 md:gap-5 mb-4 sm:mb-5 md:mb-6 lg:mb-8">
                <div className="relative">
                  {previewImage ? (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white/20">
                      <Image src={previewImage} alt="Profile" width={112} height={112} className="object-cover w-full h-full" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center border-4 border-white/20">
                      <User className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white" />
                    </div>
                  )}
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition">
                      <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-navy-900" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">
                    {user.first_name} {user.last_name}
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-400">{user.phone}</p>
                  <div className={`flex items-center gap-2 mt-1.5 sm:mt-2 ${status.color} justify-center sm:justify-start`}>
                    <span className="text-lg sm:text-xl">{status.icon}</span>
                    <span className="font-medium text-xs sm:text-sm md:text-base">{status.text}</span>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 mx-auto sm:mx-0"
                    >
                      <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Tahrirlash
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                  {/* Image Upload Section */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-white">
                      📸 Profil Rasmi
                    </label>
                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-white/20 rounded-lg p-4 sm:p-5 md:p-6 cursor-pointer hover:border-white/40 transition-colors">
                      <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <span className="text-xs sm:text-sm text-gray-300">Rasmni tanlang</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-white">
                        👤 Ism
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="input-field text-xs sm:text-sm md:text-base"
                        placeholder="Ismingiz"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-white">
                        👤 Familiya
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="input-field text-xs sm:text-sm md:text-base"
                        placeholder="Familiyangiz"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 sm:gap-3">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving || phoneValue.length !== 9}
                      className="flex-1 btn-primary flex items-center justify-center gap-2 text-xs sm:text-sm md:text-base"
                    >
                      <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setProfileImage(null)
                        // Reload profile to reset changes
                        fetchProfile()
                      }}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg font-medium text-xs sm:text-sm md:text-base transition-colors"
                    >
                      Bekor qilish
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
                  <div className="bg-white/5 p-2.5 sm:p-3 md:p-4 rounded-lg">
                    <p className="text-gray-400 text-xs sm:text-sm mb-0.5 sm:mb-1">👤 Ism, Familiya</p>
                    <p className="text-white font-medium text-xs sm:text-sm md:text-base">{user.first_name} {user.last_name}</p>
                  </div>

                  <div className="bg-white/5 p-2.5 sm:p-3 md:p-4 rounded-lg">
                    <p className="text-gray-400 text-xs sm:text-sm mb-0.5 sm:mb-1">📞 Telefon</p>
                    <p className="text-white font-medium text-xs sm:text-sm md:text-base">{user.phone}</p>
                  </div>

                  <div className="bg-white/5 p-2.5 sm:p-3 md:p-4 rounded-lg">
                    <p className="text-gray-400 text-xs sm:text-sm mb-0.5 sm:mb-1">📅 Oxirgi buyurtma</p>
                    <p className="text-white font-medium text-xs sm:text-sm md:text-base">{getLastBookingDate()}</p>
                  </div>

                  <div className="bg-white/5 p-2.5 sm:p-3 md:p-4 rounded-lg">
                    <p className="text-gray-400 text-xs sm:text-sm mb-0.5 sm:mb-1">🚗 Jami bronlar</p>
                    <p className="text-white font-medium text-xs sm:text-sm md:text-base">{bookings.length} ta</p>
                  </div>
                </div>
              )}
            </div>
              </>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="card p-4 sm:p-5 md:p-6 lg:p-8">
                {bookings.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 md:py-10 lg:py-12">
                    <Car className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-gray-600 mx-auto mb-2 sm:mb-3 md:mb-4" />
                    <p className="text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm md:text-base lg:text-lg">Hali bronlar yo'q</p>
                    <Link href="/cars" className="btn-primary inline-block text-xs sm:text-sm md:text-base">
                      Avtomobil tanlash
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="bg-white/5 p-2.5 sm:p-3 md:p-4 rounded-lg hover:bg-white/10 transition">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 md:gap-3">
                          <div>
                            <p className="text-white font-medium text-xs sm:text-sm md:text-base">{booking.car_name}</p>
                            <p className="text-gray-400 text-xs">
                              {new Date(booking.start_date).toLocaleDateString('uz-UZ')} - {new Date(booking.end_date).toLocaleDateString('uz-UZ')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                            <div className="text-right">
                              <p className="text-white font-bold text-xs sm:text-sm md:text-base">{booking.total_amount.toLocaleString()} so'm</p>
                              <p className={`text-xs ${
                                booking.status === 'confirmed' ? 'text-green-400' :
                                booking.status === 'pending' ? 'text-yellow-400' :
                                booking.status === 'cancelled' ? 'text-red-400' :
                                'text-gray-400'
                              }`}>
                                {booking.status === 'confirmed' ? '✅ Tasdiqlangan' :
                                 booking.status === 'pending' ? '⏳ Kutilmoqda' :
                                 booking.status === 'cancelled' ? '❌ Bekor qilingan' :
                                 '🏁 Yakunlangan'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
                {/* Name Change Section */}
                <div className="card p-4 sm:p-5 md:p-6 lg:p-8">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-2.5 sm:mb-3 md:mb-4 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    Ism va Familiyani o'zgartirish
                  </h3>
                  <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                        Ism
                      </label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-white/5 border border-white/10 rounded-lg text-white text-xs sm:text-sm md:text-base focus:outline-none focus:border-blue-500"
                        placeholder="Ismingizni kiriting"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                        Familiya
                      </label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-white/5 border border-white/10 rounded-lg text-white text-xs sm:text-sm md:text-base focus:outline-none focus:border-blue-500"
                        placeholder="Familiyangizni kiriting"
                      />
                    </div>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="btn-primary w-full flex items-center justify-center gap-2 text-xs sm:text-sm md:text-base"
                    >
                      <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                    </button>
                  </div>
                </div>

                {/* Password Change Section */}
                <div className="card p-4 sm:p-5 md:p-6 lg:p-8">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-2.5 sm:mb-3 md:mb-4 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    Parolni o'zgartirish
                  </h3>
                  <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                        Yangi parol
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                          className="w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-white/5 border border-white/10 rounded-lg text-white text-xs sm:text-sm md:text-base focus:outline-none focus:border-blue-500"
                          placeholder="Yangi parolingizni kiriting"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                          className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPasswords.new ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 sm:mt-1">
                        Kamida 6 ta belgi, harflar va raqamlar
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                        Yangi parolni tasdiqlang
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                          className="w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-white/5 border border-white/10 rounded-lg text-white text-xs sm:text-sm md:text-base focus:outline-none focus:border-blue-500"
                          placeholder="Yangi parolni qayta kiriting"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={handlePasswordChange}
                      disabled={saving}
                      className="btn-primary w-full flex items-center justify-center gap-2 text-xs sm:text-sm md:text-base"
                    >
                      <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      {saving ? 'O\'zgartirilmoqda...' : 'Parolni o\'zgartirish'}
                    </button>
                  </div>
                </div>

                {/* Other Settings */}
                <div className="card p-4 sm:p-5 md:p-6 lg:p-8">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-2.5 sm:mb-3 md:mb-4">Boshqa sozlamalar</h3>
                  <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                    <Link
                      href="/cars"
                      className="w-full flex items-center justify-between p-2.5 sm:p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-lg transition"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Car className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        <span className="text-white text-xs sm:text-sm md:text-base">Avtomobil bronlash</span>
                      </div>
                      <span className="text-gray-400">→</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between p-2.5 sm:p-3 md:p-4 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                        <span className="text-red-300 text-xs sm:text-sm md:text-base">Chiqish</span>
                      </div>
                      <span className="text-red-400">→</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
