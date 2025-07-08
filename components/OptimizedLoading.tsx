'use client'

import { useEffect, useState } from 'react'

interface OptimizedLoadingProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  delay?: number
}

export default function OptimizedLoading({ 
  children, 
  fallback = <div className="loading">Carregando...</div>,
  delay = 100 
}: OptimizedLoadingProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    // Mostra fallback após delay para evitar flash
    const fallbackTimer = setTimeout(() => {
      setShowFallback(true)
    }, delay)

    // Simula carregamento completo
    const loadingTimer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => {
      clearTimeout(fallbackTimer)
      clearTimeout(loadingTimer)
    }
  }, [delay])

  if (isLoading && showFallback) {
    return <>{fallback}</>
  }

  return (
    <div className={isLoading ? 'loading' : 'loaded'}>
      {children}
    </div>
  )
}

// Componente de loading inline para CSS crítico
export function CriticalLoading() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-pink-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 text-sm">Carregando...</p>
      </div>
    </div>
  )
} 