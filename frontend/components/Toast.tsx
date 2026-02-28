'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type: ToastType
  duration?: number
  onClose?: () => void
}

export function Toast({ message, type, duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const styles = {
    success: {
      bg: 'bg-gradient-to-r from-green-600 to-emerald-600',
      border: 'border-green-500/30',
      icon: CheckCircle,
      shadow: 'shadow-lg shadow-green-500/20'
    },
    error: {
      bg: 'bg-gradient-to-r from-red-600 to-rose-600',
      border: 'border-red-500/30',
      icon: AlertCircle,
      shadow: 'shadow-lg shadow-red-500/20'
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-600 to-cyan-600',
      border: 'border-blue-500/30',
      icon: Info,
      shadow: 'shadow-lg shadow-blue-500/20'
    }
  }

  const style = styles[type]
  const Icon = style.icon

  return (
    <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 ${style.bg} border ${style.border} text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl backdrop-blur-sm ${style.shadow} flex items-center gap-3 max-w-sm animate-slide-in transition-all duration-300`} style={{ zIndex: 9999 }}>
      <div className="flex-shrink-0">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <p className="text-sm sm:text-base flex-1 font-medium">{message}</p>
      <button
        onClick={() => {
          setIsVisible(false)
          onClose?.()
        }}
        className="text-white/70 hover:text-white transition-colors flex-shrink-0 ml-2"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([])

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return { toasts, showToast, removeToast }
}
