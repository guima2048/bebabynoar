'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log do erro apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.error('Application error:', error)
    }
    
    // Em produção, enviar para serviço de monitoramento (ex: Sentry)
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implementar integração com serviço de monitoramento
      // Sentry.captureException(error)
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ops! Algo deu errado</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver o problema.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={reset}
            className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
          >
            Tentar Novamente
          </button>
          <Link
            href="/"
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Voltar ao Início
          </Link>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left bg-gray-50 rounded-lg p-4">
            <summary className="cursor-pointer font-medium text-gray-700 mb-2">
              Detalhes do Erro (Desenvolvimento)
            </summary>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Mensagem:</strong> {error.message}</p>
              {error.digest && <p><strong>ID:</strong> {error.digest}</p>}
              <p><strong>Stack:</strong></p>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                {error.stack}
              </pre>
            </div>
          </details>
        )}
        
        <div className="mt-6 text-sm text-gray-500">
          <p>Se o problema persistir, entre em contato conosco.</p>
          <Link href="/contact" className="text-pink-500 hover:text-pink-600 underline">
            Página de Contato
          </Link>
        </div>
      </div>
    </div>
  )
} 