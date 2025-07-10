import { useState, useEffect } from 'react'

export function useCSRF() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCSRFToken = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/csrf', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setCsrfToken(data.csrfToken)
      } else {
        setError('Erro ao obter token CSRF')
      }
    } catch (err) {
      setError('Erro ao obter token CSRF')
    } finally {
      setLoading(false)
    }
  }

  const refreshToken = () => {
    fetchCSRFToken()
  }

  useEffect(() => {
    fetchCSRFToken()
  }, [])

  return {
    csrfToken,
    loading,
    error,
    refreshToken
  }
} 