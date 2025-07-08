'use client'

import { useEffect } from 'react'

export default function NonCriticalCSS() {
  useEffect(() => {
    // Carrega CSS não-crítico de forma assíncrona
    const loadNonCriticalCSS = () => {
      // Adiciona classe para indicar que o CSS foi carregado
      document.body.classList.add('css-loaded')
      
      // Preload de recursos não críticos
      const preloadLinks = [
        { href: '/_next/static/css/app/globals.css', as: 'style' },
        // Adicione outros recursos não críticos aqui
      ]
      
      preloadLinks.forEach(({ href, as }) => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.href = href
        link.as = as as any
        document.head.appendChild(link)
      })
    }

    // Carrega após o carregamento inicial da página
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadNonCriticalCSS)
    } else {
      loadNonCriticalCSS()
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', loadNonCriticalCSS)
    }
  }, [])

  return null
} 