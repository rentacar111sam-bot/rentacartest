'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { ArrowRight, CheckCircle, Users, Award, Zap } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000619] via-[#001122] to-[#000619]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent"></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Biz haqimizda
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              Samarqand shahrida eng ishonchli avtomobil ijarasi xizmati
            </p>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                RentCar - Sizning ishonchli hamkoringiz
              </h2>
              <p className="text-gray-300 text-lg mb-4 leading-relaxed">
                2020 yildan beri biz Samarqand shahrida eng sifatli avtomobil ijarasi xizmatini taqdim etib kelyapmiz. Bizning maqsad - har bir mijozga qulay, ishonchli va arzon narxda avtomobil ijarasi xizmatini berish.
              </p>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                Biz 150+ ta turli xil avtomobilga ega bo'lib, har bir kategoriyada eng yaxshi takliflarni taqdim etamiz. Bizning jamoamiz 24/7 sizning xizmatida turibdi.
              </p>
              <Link 
                href="/cars"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Mashinalarni ko'rish
                <ArrowRight size={20} />
              </Link>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/bosh sahifa.jpg"
                alt="RentCar"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:border-white/30 transition-all">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">60,000+ Mijozlar</h3>
              <p className="text-gray-400">
                Biz 60,000 dan ortiq mijozga xizmat ko'rsatib, ularning ishonchini qozonib oldik.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:border-white/30 transition-all">
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
                <Award className="text-green-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">150+ Avtomobillar</h3>
              <p className="text-gray-400">
                Har bir kategoriyada eng yaxshi va sifatli avtomobillarni taqdim etamiz.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:border-white/30 transition-all">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="text-purple-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">24/7 Xizmat</h3>
              <p className="text-gray-400">
                Kunning istalgan vaqtida biz sizning xizmatida turibdi va yordam beramiz.
              </p>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-white/10 rounded-2xl p-12 mb-20">
            <h2 className="text-3xl font-bold text-white mb-8">Nima uchun biz?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                'Qulay narxlar va maxsus takliflar',
                'Sifatli va yangi avtomobillar',
                'Tez va oson bron qilish',
                'Ishonchli va xavfsiz xizmat',
                'Professional jamoamiz',
                'Onlayn qo\'llab-quvvatlash'
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-300 text-lg">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Biz bilan bog'laning</h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Savollaringiz yoki takliflaringiz bo'lsa, biz bilan bog'laning. Biz sizga yordam berishdan xursand bo'lamiz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Aloqa qilish
                <ArrowRight size={20} />
              </Link>
              <a 
                href="https://www.instagram.com/rentcar.samarkand"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-3 rounded-lg font-semibold hover:border-white/60 hover:bg-white/10 transition-all"
              >
                Instagram
                <ArrowRight size={20} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
