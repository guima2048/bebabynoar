'use client'

import { useSession } from 'next-auth/react'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'

export default function TestAuthPage() {
  const { data: session, status } = useSession()
  const { user, loading } = useAuth()
  const [renderCount, setRenderCount] = useState(0)
  const [cookies, setCookies] = useState<string>('')

  // Forçar re-render para debug
  useEffect(() => {
    setRenderCount(prev => prev + 1)
  }, [])

  // Acessar cookies apenas no cliente
  useEffect(() => {
    setCookies(document.cookie || 'Nenhum cookie encontrado')
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Teste de Autenticação</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* NextAuth Session */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">NextAuth Session</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> <span className={`px-2 py-1 rounded text-sm ${status === 'loading' ? 'bg-yellow-100 text-yellow-800' : status === 'authenticated' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{status}</span></p>
            <p><strong>Render Count:</strong> {renderCount}</p>
            {session ? (
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold mb-2">Dados da Sessão:</h3>
                <pre className="text-sm overflow-auto">{JSON.stringify(session, null, 2)}</pre>
              </div>
            ) : (
              <p className="text-gray-500">Nenhuma sessão ativa</p>
            )}
          </div>
        </div>

        {/* AuthContext User */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">AuthContext User</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> <span className={`px-2 py-1 rounded text-sm ${loading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{loading ? 'Sim' : 'Não'}</span></p>
            {user ? (
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold mb-2">Dados do Usuário:</h3>
                <pre className="text-sm overflow-auto">{JSON.stringify(user, null, 2)}</pre>
              </div>
            ) : (
              <p className="text-gray-500">Nenhum usuário logado</p>
            )}
          </div>
        </div>
      </div>

      {/* Cookies Debug */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Cookies Debug</h2>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm">Cookies atuais:</p>
          <pre className="text-sm overflow-auto mt-2">{cookies}</pre>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Testes</h2>
        <div className="space-x-4">
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Recarregar Página
          </button>
          <button 
            onClick={() => console.log('Session:', session, 'User:', user, 'Status:', status)} 
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Log no Console
          </button>
        </div>
      </div>
    </div>
  )
} 