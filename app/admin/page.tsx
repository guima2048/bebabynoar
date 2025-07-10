'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { useCSRF } from '@/hooks/useCSRF'

// Validação de entrada
const validateUsername = (username: string): string | null => {
  if (!username.trim()) return 'Username é obrigatório'
  if (username.length < 3) return 'Username deve ter pelo menos 3 caracteres'
  if (username.length > 20) return 'Username deve ter no máximo 20 caracteres'
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username deve conter apenas letras, números e underscore'
  return null
}

const validatePassword = (password: string): string | null => {
  if (!password) return 'Senha é obrigatória'
  if (password.length < 6) return 'Senha deve ter pelo menos 6 caracteres'
  if (password.length > 100) return 'Senha muito longa'
  return null
}

export default function AdminPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({})
  const router = useRouter()
  const searchParams = useSearchParams()
  const { csrfToken, loading: csrfLoading, error: csrfError, refreshToken } = useCSRF()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Limpar erros anteriores
    setErrors({})
    
    // Validar campos
    const usernameError = validateUsername(username)
    const passwordError = validatePassword(password)
    
    if (usernameError || passwordError) {
      setErrors({
        ...(usernameError && { username: usernameError }),
        ...(passwordError && { password: passwordError })
      })
      
      if (usernameError) toast.error(usernameError)
      if (passwordError) toast.error(passwordError)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRF-Token': csrfToken })
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Login realizado com sucesso! Redirecionando em 2 segundos...')
        const redirectTo = searchParams.get('redirect') || '/admin/dashboard'
        
        // Aguardar 2 segundos antes de redirecionar
        setTimeout(() => {
          router.push(redirectTo)
        }, 2000)
      } else {
        toast.error(data.error || 'Erro ao fazer login')
      }
    } catch (error) {
      console.error('Erro no login:', error)
      toast.error('Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestLogin = () => {
    setUsername('admin')
    setPassword('admin123')
  }



  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h2>
          <p className="mt-2 text-sm text-gray-600">
            Acesse o painel de administração do Bebaby App
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Usuário Administrativo
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    if (errors.username) {
                      setErrors(prev => {
                        const newErrors = { ...prev }
                        delete newErrors.username
                        return newErrors
                      })
                    }
                  }}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 sm:text-sm ${
                    errors.username 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-300 focus:border-pink-500'
                  }`}
                  placeholder="Digite seu usuário"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) {
                      setErrors(prev => {
                        const newErrors = { ...prev }
                        delete newErrors.password
                        return newErrors
                      })
                    }
                  }}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 sm:text-sm ${
                    errors.password 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-300 focus:border-pink-500'
                  }`}
                  placeholder="Digite sua senha"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={handleTestLogin}
                className="text-sm text-pink-600 hover:text-pink-500"
              >
                Testar com credenciais padrão
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 