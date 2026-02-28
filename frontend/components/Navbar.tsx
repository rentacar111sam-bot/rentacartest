'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Phone, Car, User, LogOut } from 'lucide-react'
import LanguageSelector from './LanguageSelector'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [clickCount, setClickCount] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token')
    setIsLoggedIn(!!token)
  }, [])

  const navigation = [
    { name: 'Bosh sahifa', href: '/', icon: Home },
    { name: 'Mashinalar', href: '/cars', icon: Car },
    { name: 'Aloqa', href: '/contact', icon: Phone },
  ]
  
  const mobileNavigation = [
    { name: 'Bosh sahifa', href: '/', icon: Home },
    { name: 'Mashinalar', href: '/cars', icon: Car },
    { name: 'Aloqa', href: '/contact', icon: Phone },
    { name: 'Profil', href: '/profile', icon: User },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // Clear previous timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
    }
    
    setClickCount(prev => prev + 1)
    
    // Reset count after 1 second
    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0)
    }, 1000)
    
    // Check if clicked 3 times
    if (clickCount + 1 === 3) {
      setClickCount(0)
      router.push('/admin')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    router.push('/')
  }

  return (
    <>
      {/* Desktop Navigation - Top */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-navy-900/95 backdrop-blur-sm border-b border-navy-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button 
              onClick={handleLogoClick}
              className="flex items-center space-x-2 text-white font-bold text-xl hover:opacity-80 transition-opacity"
            >
              <div className="relative w-8 h-8">
                <Image
                  src="/logo.png"
                  alt="RentCar Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span>RentCar</span>
            </button>

            {/* Desktop Navigation */}
            <div className="flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Auth Buttons */}
              {isLoggedIn ? (
                <Link 
                  href="/profile"
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  <User className="w-5 h-5" />
                  Profil
                </Link>
              ) : (
                <Link 
                  href="/auth"
                  className="btn-primary px-6"
                >
                  Kirish
                </Link>
              )}
              
              <LanguageSelector />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-navy-900 border-t border-navy-700 shadow-lg">
        <div className="grid grid-cols-4 h-16">
          {mobileNavigation.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            // Profil uchun special handling
            if (item.href === '/profile') {
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    if (!isLoggedIn) {
                      router.push('/auth')
                    } else {
                      router.push(item.href)
                    }
                  }}
                  className={`flex flex-col items-center justify-center gap-1 transition-colors duration-200 ${
                    active
                      ? 'text-white bg-navy-800'
                      : 'text-gray-400 hover:text-white hover:bg-navy-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'scale-110' : ''}`} />
                  <span className="text-xs font-medium">{item.name}</span>
                </button>
              )
            }
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 transition-colors duration-200 ${
                  active
                    ? 'text-white bg-navy-800'
                    : 'text-gray-400 hover:text-white hover:bg-navy-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'scale-110' : ''}`} />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Mobile Top Bar - Logo and Language */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-navy-900/95 backdrop-blur-sm border-b border-navy-700">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14">
            <button 
              onClick={handleLogoClick}
              className="flex items-center space-x-2 text-white font-bold text-base sm:text-lg hover:opacity-80 transition-opacity"
            >
              <div className="relative w-6 h-6 sm:w-7 sm:h-7">
                <Image
                  src="/logo.png"
                  alt="RentCar Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="hidden sm:inline">RentCar</span>
            </button>
            <div className="flex items-center gap-2">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}