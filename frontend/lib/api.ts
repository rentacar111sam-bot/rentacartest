import axios from 'axios'
import { Car, Booking, ContactMessage, BookingFormData, ContactFormData, ApiResponse, DashboardStats } from '@/types'
import { apiCache, CACHE_KEYS, CACHE_DURATION } from './cache'

// Dinamik API URL - telefondan ham, kompyuterdan ham ishlashi uchun
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'https://rentcarsamarkand.uz/api'
  }
  
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_API_URL || 'https://rentcarsamarkand.uz/api'
  }
  
  // Development: localhost yoki IP manzilni aniqlash
  const hostname = window.location.hostname
  const port = 5000
  
  // Agar localhost bo'lsa, localhost:5000 ishlatish
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://localhost:${port}/api`
  }
  
  // Agar IP manzil bo'lsa, shu IP'ni ishlatish (telefondan kirish uchun)
  return `http://${hostname}:${port}/api`
}

const API_BASE_URL = getApiBaseUrl()

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 sekund timeout
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  
  // Don't set Content-Type for FormData - let browser set it
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token')
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

// Cars API
export const getCars = async (params?: {
  category?: string
  price_range?: string
  search?: string
  id?: string
}): Promise<Car[]> => {
  // Check cache first
  const cacheKey = CACHE_KEYS.CARS_FILTERED(params?.category, params?.price_range, params?.search)
  const cached = apiCache.get<Car[]>(cacheKey)
  if (cached) {
    console.log('📦 Using cached cars data')
    return cached
  }

  const response = await api.get('/cars', { params })
  const data = response.data
  
  // Cache the result
  apiCache.set(cacheKey, data, CACHE_DURATION.CARS)
  
  return data
}

export const getAllCars = async (params?: {
  category?: string
  search?: string
}): Promise<Car[]> => {
  const response = await api.get('/cars/admin/all', { params })
  return response.data
}

export const getCarById = async (id: string): Promise<Car> => {
  const response = await api.get(`/cars?id=${id}`)
  return response.data
}

export const getCar = async (id: string): Promise<Car> => {
  const response = await api.get(`/cars?id=${id}`)
  return response.data
}

export const createCar = async (carData: Partial<Car>): Promise<ApiResponse> => {
  const response = await api.post('/cars', carData)
  return response.data
}

export const updateCar = async (id: number, carData: Partial<Car>): Promise<ApiResponse> => {
  const response = await api.put(`/cars/${id}`, carData)
  return response.data
}

export const deleteCar = async (id: number): Promise<ApiResponse> => {
  const response = await api.delete(`/cars/${id}`)
  return response.data
}

// Bookings API
export const getBookings = async (params?: {
  id?: string
  status?: string
  page?: number
  limit?: number
}): Promise<{ bookings: Booking[], total: number, page: number, limit: number }> => {
  // Check cache first
  const cacheKey = CACHE_KEYS.BOOKINGS
  const cached = apiCache.get<{ bookings: Booking[], total: number, page: number, limit: number }>(cacheKey)
  if (cached) {
    console.log('📦 Using cached bookings data')
    return cached
  }

  const response = await api.get('/bookings', { params })
  const data = response.data
  
  // Cache the result
  apiCache.set(cacheKey, data, CACHE_DURATION.BOOKINGS)
  
  return data
}

export const createBooking = async (bookingData: FormData): Promise<ApiResponse> => {
  try {
    // Log FormData contents for debugging
    console.log('FormData contents:')
    const entries = Array.from(bookingData.entries())
    entries.forEach(([key, value]) => {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`)
      } else {
        console.log(`  ${key}: ${value}`)
      }
    })
    
    const response = await api.post('/bookings', bookingData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 second timeout for file uploads
    })
    return response.data
  } catch (error) {
    console.error('createBooking error:', error)
    throw error
  }
}

export const updateBookingStatus = async (bookingId: string, status: string): Promise<ApiResponse> => {
  const response = await api.put(`/bookings/${bookingId}`, { status })
  return response.data
}

export const deleteBooking = async (bookingId: string): Promise<ApiResponse> => {
  const response = await api.delete(`/bookings/${bookingId}`)
  return response.data
}

export const getBookingStats = async (): Promise<any> => {
  const response = await api.get('/bookings/stats')
  return response.data
}

// Contact API
export const createContactMessage = async (messageData: ContactFormData): Promise<ApiResponse> => {
  const response = await api.post('/contact/', messageData)
  return response.data
}

export const getContactMessages = async (params?: {
  page?: number
  limit?: number
  status?: string
}): Promise<{ messages: ContactMessage[], total: number, page: number, limit: number }> => {
  const response = await api.get('/contact', { params })
  return response.data
}

export const updateContactMessageStatus = async (id: number, status: string): Promise<ApiResponse> => {
  const response = await api.put(`/contact/${id}`, { status })
  return response.data
}

export const deleteContactMessage = async (id: number): Promise<ApiResponse> => {
  const response = await api.delete(`/contact/${id}`)
  return response.data
}

// Admin API
export const login = async (username: string, password: string): Promise<{ success: boolean, access_token: string, user: any }> => {
  const response = await api.post('/auth/login', { username, password })
  return response.data
}

export const getCurrentUser = async (): Promise<any> => {
  const response = await api.get('/auth/me')
  return response.data
}

export const changePassword = async (currentPassword: string, newPassword: string): Promise<ApiResponse> => {
  const response = await api.post('/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword
  })
  return response.data
}

export const getDashboardStats = async (): Promise<{ stats: DashboardStats, recent_bookings: Booking[] }> => {
  // Check cache first
  const cacheKey = CACHE_KEYS.DASHBOARD
  const cached = apiCache.get<{ stats: DashboardStats, recent_bookings: Booking[] }>(cacheKey)
  if (cached) {
    console.log('📦 Using cached dashboard data')
    return cached
  }

  const response = await api.get('/admin/dashboard')
  const data = response.data
  
  // Cache the result
  apiCache.set(cacheKey, data, CACHE_DURATION.DASHBOARD)
  
  return data
}

export const getAdminBookings = async (params?: {
  page?: number
  limit?: number
  status?: string
}): Promise<{ bookings: Booking[], total: number, page: number, limit: number }> => {
  const response = await api.get('/admin/bookings', { params })
  return response.data
}

export const updateAdminBookingStatus = async (bookingId: string, status: string): Promise<ApiResponse> => {
  const response = await api.put(`/admin/bookings/${bookingId}/status`, { status })
  return response.data
}

export const getAdminCars = async (params?: {
  page?: number
  limit?: number
  category?: string
}): Promise<{ cars: Car[], total: number, page: number, limit: number }> => {
  const response = await api.get('/admin/cars', { params })
  return response.data
}

export const createAdminCar = async (carData: Partial<Car>): Promise<ApiResponse> => {
  const response = await api.post('/admin/cars', carData)
  return response.data
}

export const updateAdminCar = async (id: number, carData: Partial<Car>): Promise<ApiResponse> => {
  const response = await api.put(`/admin/cars/${id}`, carData)
  return response.data
}

export const deleteAdminCar = async (id: number): Promise<ApiResponse> => {
  const response = await api.delete(`/admin/cars/${id}`)
  return response.data
}

export const getAdminMessages = async (params?: {
  page?: number
  limit?: number
  status?: string
}): Promise<{ messages: ContactMessage[], total: number, page: number, limit: number }> => {
  const response = await api.get('/admin/messages', { params })
  return response.data
}

export const updateAdminMessageStatus = async (id: number, status: string): Promise<ApiResponse> => {
  const response = await api.put(`/admin/messages/${id}/status`, { status })
  return response.data
}

// Utility functions
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m'
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('uz-UZ')
}

export const calculateDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export const calculateTotalAmount = (carPrice: number, days: number): number => {
  return carPrice * days
}

export const calculateDeposit = (totalAmount: number): number => {
  return Math.round(totalAmount * 0.5) // 50% deposit
}

// Settings API
export const getSettings = async (): Promise<Record<string, string>> => {
  const response = await api.get('/admin/settings')
  return response.data.settings || {}
}

export const updateSettings = async (settings: Record<string, string>): Promise<ApiResponse> => {
  const response = await api.put('/admin/settings', settings)
  return response.data
}

export const changeAdminPassword = async (password: string): Promise<ApiResponse> => {
  const response = await api.post('/admin/change-password', { password })
  return response.data
}

export const getPaymentCard = async (): Promise<{ card_number: string | null, card_image: string | null }> => {
  // Check cache first
  const cacheKey = CACHE_KEYS.PAYMENT_CARD
  const cached = apiCache.get<{ card_number: string | null, card_image: string | null }>(cacheKey)
  if (cached) {
    console.log('📦 Using cached payment card data')
    return cached
  }

  const response = await api.get('/cars/payment-card')
  const data = response.data
  
  // Cache the result
  apiCache.set(cacheKey, data, CACHE_DURATION.PAYMENT_CARD)
  
  return data
}