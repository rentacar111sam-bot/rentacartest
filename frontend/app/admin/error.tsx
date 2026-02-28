'use client'

import { useEffect } from 'react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000619] via-[#001122] to-[#000619] flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Xatolik yuz berdi</h2>
        <p className="text-gray-400 mb-6">{error.message}</p>
        <button
          onClick={() => reset()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-all"
        >
          Qayta urinish
        </button>
      </div>
    </div>
  )
}
