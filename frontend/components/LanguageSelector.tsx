'use client'

import { Globe } from 'lucide-react'

export default function LanguageSelector() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300">
      <Globe className="w-5 h-5 text-gray-400" />
      <span className="hidden md:inline text-sm font-medium">UZ</span>
    </div>
  )
}
