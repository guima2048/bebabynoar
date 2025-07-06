'use client'

import { useEffect, useState } from 'react'

export default function TestPage() {
  const [message, setMessage] = useState('Carregando...')

  useEffect(() => {
    console.log('🧪 TestPage: Componente montado')
    setMessage('Página de teste funcionando!')
  }, [])

  console.log('🧪 TestPage: Renderizando...')

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Página de Teste</h1>
      <p className="text-gray-600 mb-4">{message}</p>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800">
          ✅ Se você está vendo esta mensagem, o React e Next.js estão funcionando corretamente!
        </p>
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          📊 Verifique o console do navegador para ver os logs de debug.
        </p>
      </div>
    </div>
  )
} 