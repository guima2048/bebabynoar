'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Loader2, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function ResetPassword() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'form' | 'success' | 'error' | 'expired'>('loading')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    const emailParam = searchParams.get('email')

    if (!tokenParam || !emailParam) {
      setStatus('error')
      setMessage('Link de recuperação inválido')
      return
    }

    setToken(tokenParam)
    setEmail(emailParam)
    setStatus('form')
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setMessage('As senhas não coincidem')
      return
    }

    if (newPassword.length < 6) {
      setMessage('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/reset-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          email, 
          newPassword 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
      } else {
        if (data.error === 'Token expirado') {
          setStatus('expired')
        } else {
          setStatus('error')
          setMessage(data.error || 'Erro ao alterar senha')
        }
      }
    } catch (error) {
      setStatus('error')
      setMessage('Erro de conexão. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resendResetEmail = async () => {
    try {
      setStatus('loading')
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('Novo email de recuperação enviado!')
      } else {
        setStatus('error')
        setMessage(data.error || 'Erro ao reenviar email')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Erro de conexão. Tente novamente.')
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-pink-600 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Verificando link...
            </h2>
            <p className="text-gray-600">
              Aguarde enquanto verificamos seu link de recuperação.
            </p>
          </div>
        )

      case 'form':
        return (
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Redefinir Senha
              </h2>
              <p className="text-gray-600">
                Digite sua nova senha abaixo
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nova Senha */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Digite sua nova senha"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo 6 caracteres
                </p>
              </div>

              {/* Confirmar Senha */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Confirme sua nova senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Mensagem de erro */}
              {message && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{message}</p>
                </div>
              )}

              {/* Botão de envio */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-pink-600 text-white py-3 rounded-xl font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Alterando Senha...
                  </>
                ) : (
                  <>
                    Alterar Senha
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Dicas de segurança */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                💡 Dicas para uma senha segura:
              </h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Use pelo menos 8 caracteres</li>
                <li>• Combine letras maiúsculas e minúsculas</li>
                <li>• Inclua números e símbolos</li>
                <li>• Evite informações pessoais</li>
              </ul>
            </div>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Senha alterada com sucesso!
            </h2>
            <p className="text-gray-600 mb-8">
              Sua senha foi alterada e você pode fazer login com a nova senha.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-green-900 mb-3">
                🔒 Próximos passos:
              </h3>
              <ul className="text-green-800 space-y-2 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Faça login com sua nova senha
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Ative a verificação em duas etapas (recomendado)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Revise as configurações de segurança
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="bg-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
              >
                Fazer Login
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="border-2 border-pink-600 text-pink-600 px-8 py-3 rounded-xl font-semibold hover:bg-pink-50 transition-colors"
              >
                Voltar ao Início
              </Link>
            </div>
          </div>
        )

      case 'error':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Erro na recuperação
            </h2>
            <p className="text-gray-600 mb-8">
              {message}
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
              <h3 style={{ color: '#991b1b', marginBottom: '10px', fontSize: '16px' }}>
                O que você pode fazer:
              </h3>
              <ul style={{ color: '#991b1b', lineHeight: '1.6', margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                <li>Verificar se o link está completo</li>
                <li>Tentar novamente</li>
                <li>Entrar em contato com o suporte</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resendResetEmail}
                className="bg-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-pink-700 transition-colors"
              >
                Reenviar Email
              </button>
              <Link
                href="/contact"
                className="border-2 border-pink-600 text-pink-600 px-8 py-3 rounded-xl font-semibold hover:bg-pink-50 transition-colors"
              >
                Contatar Suporte
              </Link>
            </div>
          </div>
        )

      case 'expired':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Link expirado
            </h2>
            <p className="text-gray-600 mb-8">
              Este link de recuperação expirou. Links de recuperação são válidos por 1 hora.
            </p>
            
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-orange-900 mb-3">
                Para continuar:
              </h3>
              <p className="text-orange-800">
                Clique no botão abaixo para receber um novo email de recuperação.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resendResetEmail}
                className="bg-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-pink-700 transition-colors"
              >
                Enviar Novo Email
              </button>
              <Link
                href="/login"
                className="border-2 border-pink-600 text-pink-600 px-8 py-3 rounded-xl font-semibold hover:bg-pink-50 transition-colors"
              >
                Voltar ao Login
              </Link>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md mx-auto w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">B</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Bebaby App</h1>
        </div>

        {/* Conteúdo principal */}
        <div className="bg-white rounded-2xl shadow-xl border p-8">
          {renderContent()}
        </div>

        {/* Links úteis */}
        <div className="mt-8 text-center">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/login" className="text-pink-600 hover:underline">
              Fazer Login
            </Link>
            <Link href="/register" className="text-pink-600 hover:underline">
              Criar Conta
            </Link>
            <Link href="/contact" className="text-pink-600 hover:underline">
              Suporte
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 