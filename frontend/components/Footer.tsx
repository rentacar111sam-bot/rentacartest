'use client'

import Link from 'next/link'
import { Facebook, Instagram, Send, Phone, Mail, MapPin, Clock, Heart } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="hidden md:block bg-gradient-to-b from-navy-900 to-black text-gray-300 pt-12 sm:pt-16 md:pt-20 pb-6 sm:pb-8">
      {/* Main Footer Content */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 mb-8 sm:mb-10 md:mb-12">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RC</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">RentCar</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              {t('footer.aboutText')}
            </p>
            <div className="flex gap-3 pt-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 hover:bg-blue-500 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 hover:bg-pink-500 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://telegram.me" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 hover:bg-cyan-500 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-base sm:text-lg font-bold text-white">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link href="/cars" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('nav.cars')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('nav.contact')}
                </Link>
              </li>
              <li>
                <Link href="/auth" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('nav.profile')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-base sm:text-lg font-bold text-white">{t('footer.categories')}</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/cars?category=byudjetillar" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('cars.categories.byudjetillar')}
                </Link>
              </li>
              <li>
                <Link href="/cars?category=komfortli" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('cars.categories.komfortli')}
                </Link>
              </li>
              <li>
                <Link href="/cars?category=premiumlar" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('cars.categories.premiumlar')}
                </Link>
              </li>
              <li>
                <Link href="/cars?category=krossoverlar" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('cars.categories.krossoverlar')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-base sm:text-lg font-bold text-white">{t('footer.contact')}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">{t('contact.phone')}</p>
                  <a href="tel:+998953301111" className="text-xs sm:text-sm text-white hover:text-blue-400 transition-colors">
                    {t('contact.phone1')}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">{t('contact.email')}</p>
                  <a href="mailto:rentacar111sam@gmail.com" className="text-xs sm:text-sm text-white hover:text-blue-400 transition-colors break-all">
                    {t('contact.emailAddress')}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">{t('contact.address')}</p>
                  <p className="text-xs sm:text-sm text-white">
                    {t('contact.addressText')}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">{t('contact.workingHours')}</p>
                  <p className="text-xs sm:text-sm text-white">{t('contact.workingHoursText')}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-8 sm:my-10 hidden"></div>

        {/* Bottom Footer */}
        <div className="hidden"></div>
      </div>
    </footer>
  )
}
