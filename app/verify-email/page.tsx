'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function VerifyEmail() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const emailParam = searchParams.get('email')
    const expired = searchParams.get('expired')

    if (expired === 'true') {
      setStatus('expired')
      setMessage('Seu link de verificação expirou. Solicite um novo.')
      if (emailParam) {
        setEmail(emailParam)
      }
      return
    }

    if (!token || !emailParam) {
      setStatus('error')
      setMessage('Link de verificação inválido ou você precisa verificar seu e-mail para continuar.')
      if (emailParam) {
        setEmail(emailParam)
      }
      return
    }

    setEmail(emailParam)
    verifyEmail(token, emailParam)
  }, [searchParams])

  const verifyEmail = async (token: string, email: string) => {
    try {
      const response = await fetch('/api/verify-email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('Email verificado com sucesso!')
      } else {
        if (data.error === 'Token expirado') {
          setStatus('expired')
          setMessage('Link de verificação expirado')
        } else {
          setStatus('error')
          setMessage(data.error || 'Erro ao verificar email')
        }
      }
    } catch (error) {
      setStatus('error')
      setMessage('Erro de conexão. Tente novamente.')
    }
  }

  const resendVerification = async () => {
    try {
      setStatus('loading')
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('Novo email de verificação enviado!')
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
              Verificando seu email...
            </h2>
            <p className="text-gray-600">
              Aguarde enquanto verificamos seu link de verificação.
            </p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Email verificado com sucesso!
            </h2>
            <p className="text-gray-600 mb-8">
              Parabéns! Seu email foi verificado e sua conta está ativa.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-green-900 mb-3">
                🎉 O que você pode fazer agora:
              </h3>
              <ul className="text-green-800 space-y-2 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Completar seu perfil
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Explorar outros usuários
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Enviar mensagens
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Participar da comunidade
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/profile"
                className="bg-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
              >
                Acessar Minha Conta
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/explore"
                className="border-2 border-pink-600 text-pink-600 px-8 py-3 rounded-xl font-semibold hover:bg-pink-50 transition-colors"
              >
                Explorar Perfis
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
              Erro na verificação
            </h2>
            <p className="text-gray-600 mb-8">
              {message}
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-red-900 mb-3">
                O que você pode fazer:
              </h3>
              <ul className="text-red-800 space-y-2 text-left">
                <li>• Verificar se o link está completo</li>
                <li>• Tentar novamente</li>
                <li>• Entrar em contato com o suporte</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resendVerification}
                className="bg-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
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
              Este link de verificação expirou. Links de verificação são válidos por 24 horas.
            </p>
            
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-orange-900 mb-3">
                Para continuar:
              </h3>
              <p className="text-orange-800">
                Clique no botão abaixo para receber um novo email de verificação.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resendVerification}
                className="bg-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Enviar Novo Email
              </button>
              <Link
                href="/"
                className="border-2 border-pink-600 text-pink-600 px-8 py-3 rounded-xl font-semibold hover:bg-pink-50 transition-colors"
              >
                Voltar ao Início
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
            <Link href="/about" className="text-pink-600 hover:underline">
              Sobre Nós
            </Link>
            <Link href="/contact" className="text-pink-600 hover:underline">
              Contato
            </Link>
            <Link href="/help" className="text-pink-600 hover:underline">
              Ajuda
            </Link>
            <Link href="/terms" className="text-pink-600 hover:underline">
              Termos
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 