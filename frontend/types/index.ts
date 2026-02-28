export interface Car {
  id: number
  name: string
  category: 'byudjetillar' | 'komfortli' | 'premiumlar' | 'krossoverlar'
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
  created_at: string
  updated_at: string
}

export interface Booking {
  id: number
  booking_id: string
  car_id: number
  car_name?: string
  car_image?: string
  first_name: string
  last_name: string
  phone: string
  email: string
  start_date: string
  end_date: string
  total_days: number
  total_amount: number
  deposit_amount: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  passport_front?: string
  passport_back?: string
  driver_license?: string
  payment_receipt?: string
  created_at: string
  updated_at: string
}

export interface ContactMessage {
  id: number
  name: string
  phone: string
  email: string
  subject: string
  message: string
  status: 'new' | 'read' | 'replied'
  created_at: string
}

export interface AdminUser {
  id: number
  username: string
  email: string
  role: 'admin' | 'manager'
  created_at: string
}

export interface BookingFormData {
  carId: string
  startDate: string
  endDate: string
  firstName: string
  lastName: string
  phone: string
  email: string
  passportFront: File | null
  passportBack: File | null
  driverLicense: File | null
  paymentReceipt: File | null
}

export interface ContactFormData {
  name: string
  phone: string
  email: string
  subject: string
  message: string
}

export interface ApiResponse<T = any> {
  success?: boolean
  error?: string
  message?: string
  data?: T
  booking_id?: string
  access_token?: string
  user?: any
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface DashboardStats {
  total_cars: number
  total_bookings: number
  pending_bookings: number
  confirmed_bookings: number
  completed_bookings: number
  cancelled_bookings: number
  active_bookings: number
  monthly_revenue: number
}