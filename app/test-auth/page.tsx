'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'

export default function TestAuthPage() {
  const { user, loading } = useAuth()
  const [renderCount, setRenderCount] = useState(0)

  useEffect(() => {
    setRenderCount(prev => prev + 1)
  })

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Teste de Autenticação</h1>
        
        <div className="space-y-4">
          <div>
            <strong>Renderizações:</strong> {renderCount}
          </div>
          
          <div>
            <strong>Loading:</strong> {loading ? 'Sim' : 'Não'}
          </div>
          
          <div>
            <strong>Usuário:</strong> {user ? 'Logado' : 'Não logado'}
          </div>
          
          {user && (
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Dados do usuário:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Status do Firebase:</h3>
            <p>Verificando se o Firebase está funcionando...</p>
          </div>
        </div>
      </div>
    </div>
  )
} 