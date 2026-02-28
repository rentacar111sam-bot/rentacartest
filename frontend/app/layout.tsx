import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RentCar - Avtomobil Ijarasi',
  description: 'Eng yaxshi avtomobil ijarasi xizmati. Qulay narxlarda sifatli avtomobillar.',
  keywords: 'avtomobil ijara, rent car, mashina ijara, Toshkent',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'RentCar',
  },
  formatDetection: {
    telephone: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    url: 'https://rentcar.uz',
    siteName: 'RentCar',
    title: 'RentCar - Avtomobil Ijarasi',
    description: 'Eng yaxshi avtomobil ijarasi xizmati',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RentCar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RentCar - Avtomobil Ijarasi',
    description: 'Eng yaxshi avtomobil ijarasi xizmati',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uz">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="RentCar" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/logo.png" as="image" />
        <link rel="preload" href="/manifest.json" as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href="/sw.js" as="script" />
        
        {/* DNS prefetch */}
        <link rel="dns-prefetch" href="http://localhost:5000" />
        <link rel="prefetch" href="http://localhost:5000/api/cars" />
        <link rel="prefetch" href="http://localhost:5000/api/categories" />
      </head>
      <body className={inter.className}>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  )
}