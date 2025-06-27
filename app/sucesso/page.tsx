'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SucessoPage() {
  const searchParams = useSearchParams()
  const [action, setAction] = useState<string>('')
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    const actionParam = searchParams.get('action')
    setAction(actionParam || '')

    switch (actionParam) {
      case 'register':
        setMessage('Seu cadastro foi realizado com sucesso! Verifique seu e-mail para confirmar sua conta.')
        break
      case 'payment':
        setMessage('Seu pagamento foi processado com sucesso! Seu status premium será ativado em breve.')
        break
      case 'profile-update':
        setMessage('Seu perfil foi atualizado com sucesso!')
        break
      case 'photo-request':
        setMessage('Sua solicitação de acesso às fotos privadas foi enviada com sucesso!')
        break
      case 'interest':
        setMessage('Seu interesse foi registrado com sucesso! O usuário será notificado.')
        break
      case 'message':
        setMessage('Sua mensagem foi enviada com sucesso!')
        break
      default:
        setMessage('Ação realizada com sucesso!')
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Ícone de Sucesso */}
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Sucesso!
        </h1>

        {/* Mensagem */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          {message}
        </p>

        {/* Botões de Ação */}
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full bg-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-pink-700 transition-colors block"
          >
            Voltar ao Início
          </Link>

          {action === 'register' && (
            <Link
              href="/login"
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors block"
            >
              Fazer Login
            </Link>
          )}

          {action === 'payment' && (
            <Link
              href="/premium"
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors block"
            >
              Ver Benefícios Premium
            </Link>
          )}

          {action === 'profile-update' && (
            <Link
              href="/profile/edit"
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors block"
            >
              Continuar Editando
            </Link>
          )}

          {action === 'photo-request' && (
            <Link
              href="/explore"
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors block"
            >
              Explorar Perfis
            </Link>
          )}

          {action === 'interest' && (
            <Link
              href="/explore"
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors block"
            >
              Explorar Mais Perfis
            </Link>
          )}

          {action === 'message' && (
            <Link
              href="/messages"
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors block"
            >
              Ver Conversas
            </Link>
          )}
        </div>

        {/* Informações Adicionais */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Precisa de ajuda? Entre em contato conosco através do suporte.
          </p>
        </div>
      </div>
    </div>
  )
} 