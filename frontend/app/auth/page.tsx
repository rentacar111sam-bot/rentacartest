'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, User, Phone, Eye, EyeOff } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { Toast } from '@/components/Toast'

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: ''
  })

  const [phoneValue, setPhoneValue] = useState<string>('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // Faqat raqamlar
    if (value.length <= 9) {
      setPhoneValue(value)
      setFormData(prev => ({ ...prev, phone: '+998' + value }))
    }
  }

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'
    }
    
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    
    if (!hasLetter || !hasNumber) {
      return 'Parol harf va raqamdan iborat bo\'lishi kerak'
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate phone number
    if (phoneValue.length !== 9) {
      setToast({ message: 'Telefon raqam 9 ta raqamdan iborat bo\'lishi kerak', type: 'error' })
      return
    }
    
    // Validate password
    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      setToast({ message: passwordError, type: 'error' })
      return
    }
    
    // Check password confirmation for register
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setToast({ message: 'Parollar mos kelmadi', type: 'error' })
      return
    }
    
    // Clear old tokens before login/register
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    
    setLoading(true)

    try {
      const endpoint = isLogin ? '/api/user/login' : '/api/user/register'
      const payload = isLogin 
        ? { phone: formData.phone, password: formData.password }
        : { 
            phone: formData.phone, 
            password: formData.password,
            first_name: formData.first_name,
            last_name: formData.last_name
          }

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        setToast({ message: data.error || 'Xatolik yuz berdi', type: 'error' })
        return
      }

      console.log('Auth successful, data:', data)
      console.log('Saving token:', data.access_token)

      // Save token
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      console.log('Token saved, checking:', localStorage.getItem('access_token'))

      setToast({ message: data.message, type: 'success' })
      
      // Redirect based on action
      setTimeout(() => {
        console.log('Redirecting...')
        const savedToken = localStorage.getItem('access_token')
        console.log('Token before redirect:', savedToken)
        
        // If registering, redirect to login page
        if (!isLogin) {
          router.push('/auth')
        } else {
          // If logging in, redirect to profile
          router.push('/profile')
        }
      }, 1500)
    } catch (error) {
      console.error('Error:', error)
      setToast({ message: 'Xatolik yuz berdi', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800">
      <Navbar />
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <section className="pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-10 md:pb-12">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="max-w-md mx-auto">
            <div className="card p-5 sm:p-6 md:p-8">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-1.5 sm:mb-2 text-white">
                {isLogin ? 'Kirish' : 'Ro\'yxatdan o\'tish muvaffaqiyatli!'}
              </h1>
              <p className="text-center text-gray-400 mb-5 sm:mb-6 md:mb-8 text-xs sm:text-sm md:text-base">
                {isLogin 
                  ? 'Akkauntingizga kiring' 
                  : 'Endi akkauntingizga kiring'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3 md:space-y-4">
                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-white">
                        Ism
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 sm:top-3 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          className="input-field pl-9 sm:pl-10 text-white text-xs sm:text-sm md:text-base"
                          placeholder="Ismingiz"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-white">
                        Familiya
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 sm:top-3 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          className="input-field pl-9 sm:pl-10 text-white text-xs sm:text-sm md:text-base"
                          placeholder="Familiyangiz"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-white">
                    Telefon
                  </label>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="flex items-center justify-center px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-white/5 border border-white/20 rounded-lg text-white font-medium text-xs sm:text-sm md:text-base whitespace-nowrap">
                      +998
                    </div>
                    <input
                      type="tel"
                      value={phoneValue}
                      onChange={handlePhoneChange}
                      className="input-field flex-1 text-white text-xs sm:text-sm md:text-base"
                      placeholder="XX XXX XX XX"
                      maxLength={9}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 sm:mt-1">9 ta raqam kiriting</p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-white">
                    Parol
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 sm:top-3 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="input-field pl-9 sm:pl-10 pr-9 sm:pr-10 text-white text-xs sm:text-sm md:text-base"
                      placeholder="••••••••"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 sm:top-3 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 sm:mt-1">Kamida 6 ta belgi, harf va raqam</p>
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-white">
                      Parolni tasdiqlang
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 sm:top-3 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="input-field pl-9 sm:pl-10 pr-9 sm:pr-10 text-white text-xs sm:text-sm md:text-base"
                        placeholder="••••••••"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 sm:top-3 text-gray-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || phoneValue.length !== 9}
                  className="btn-primary w-full mt-3 sm:mt-4 md:mt-6 text-xs sm:text-sm md:text-base"
                >
                  {loading 
                    ? 'Kutilmoqda...' 
                    : (isLogin ? 'Kirish' : 'Ro\'yxatdan o\'tish')}
                </button>
              </form>

              <div className="mt-4 sm:mt-5 md:mt-6 text-center">
                <p className="text-gray-400 text-xs sm:text-sm">
                  {isLogin 
                    ? 'Akkauntingiz yo\'qmi? ' 
                    : 'Allaqachon akkauntingiz bormi? '}
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin)
                      setFormData({
                        phone: '',
                        password: '',
                        confirmPassword: '',
                        first_name: '',
                        last_name: ''
                      })
                      setPhoneValue('')
                      setShowPassword(false)
                      setShowConfirmPassword(false)
                    }}
                    className="text-primary-500 hover:text-primary-400 font-semibold"
                  >
                    {isLogin ? 'Ro\'yxatdan o\'ting' : 'Kiring'}
                  </button>
                </p>
              </div>

              <div className="mt-4 sm:mt-5 md:mt-6 pt-4 sm:pt-5 md:pt-6 border-t border-white/10">
                <Link 
                  href="/"
                  className="text-center block text-gray-400 hover:text-white transition text-xs sm:text-sm"
                >
                  ← Bosh sahifaga qaytish
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
