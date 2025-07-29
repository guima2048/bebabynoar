'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRef } from 'react'

export default function VerifyEmail() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const cooldownRef = useRef<NodeJS.Timeout | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  // Redirecionar automaticamente após sucesso
  useEffect(() => {
    if (status === 'success') {
      const timeout = setTimeout(() => {
        router.push('/profile')
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [status, router])

  // Cooldown inicia ao acessar a página após cadastro OU ao reenviar
  useEffect(() => {
    // Se acabou de cadastrar (mensagem de sucesso padrão), inicia cooldown
    if (status === 'success' && message.includes('Acabamos de te enviar um e-mail de confirmação')) {
      setResendCooldown(60)
    }
  }, [status, message])

  useEffect(() => {
    if (resendCooldown > 0) {
      const interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [resendCooldown])

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
    if (resendCooldown > 0) return
    setResendLoading(true)
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
        setResendCooldown(60)
      } else {
        setStatus('error')
        setMessage(data.error || 'Erro ao reenviar email')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Erro de conexão. Tente novamente.')
    } finally {
      setResendLoading(false)
    }
  }

  // Novo conteúdo amigável para pós-cadastro
  const renderContent = () => {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-6">
          {/* Ícone de carta com check verde */}
          <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
            {/* Emoji carta + check, pode trocar por SVG se quiser */}
            <span style={{ fontSize: 40 }}>💌</span>
            <span className="-ml-4 -mb-6 text-green-600" style={{ fontSize: 32 }}>✔️</span>
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Acabamos de te enviar um e-mail de confirmação.
        </h2>
        <p className="text-gray-700 mb-4">
          <b>Procure por <span className="text-pink-700">bebaby@bebaby.app</span> na sua caixa de entrada.</b>
        </p>
        <p className="text-gray-700 mb-4">
          Não achou? Dá uma espiada no <b>spam</b> ou <b>lixo eletrônico</b> e clica em <b>&quot;Não é spam&quot;</b> pra garantir que você receba todos os nossos próximos mimos.
        </p>
        <p className="text-gray-700 mb-6">
          👉 Só depois de confirmar você vai descobrir tudo que te espera lá dentro.<br/>
          <span className="text-pink-700 font-semibold">Spoiler:</span> o que tem lá dentro não é pra qualquer um. Mas você é especial, né?
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <button
            onClick={resendVerification}
            className={`bg-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-pink-700 transition-colors flex items-center justify-center gap-2 ${resendCooldown > 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={resendCooldown > 0 || resendLoading}
          >
            {resendLoading ? (
              <span className="animate-spin mr-2"><Loader2 className="w-5 h-5" /></span>
            ) : (
              <span style={{ fontSize: 20 }}>💌</span>
            )}
            {resendCooldown > 0 ? `Aguarde ${resendCooldown}s` : 'Reenviar E-mail'}
          </button>
          <button
            onClick={() => router.push('/')}
            className="border-2 border-pink-600 text-pink-600 px-8 py-3 rounded-xl font-semibold hover:bg-pink-50 transition-colors"
            type="button"
          >
            Sair
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100">
      {/* Imagem de fundo */}
      <div className="absolute inset-0 z-0">
        <img
          src="/landing/baby-1.png"
          alt="Banner Bebaby"
          className="w-full h-full object-cover object-center"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-pink-900/60" />
      </div>
      {/* Cartão centralizado */}
      <div className="relative z-10 w-full max-w-md mx-auto p-6 bg-white/30 rounded-2xl shadow-xl border border-yellow-300/60 backdrop-blur-md">
        {!mounted ? (
          <div className="h-40 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
          </div>
        ) : (
          // ...restante do conteúdo original...
          // Substitua aqui pelo conteúdo que já existe dentro do cartão centralizado
          // Exemplo:
          <>{renderContent()}</>
        )}
      </div>
    </div>
  )
} 