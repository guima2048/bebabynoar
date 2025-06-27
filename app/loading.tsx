import React from 'react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        {/* Logo animado */}
        <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
          <span className="text-white font-bold text-2xl">B</span>
        </div>
        
        {/* Texto de carregamento */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Carregando...
        </h2>
        
        <p className="text-gray-600 mb-8">
          Preparando sua experiência no Bebaby App
        </p>

        {/* Spinner */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>

        {/* Dicas de carregamento */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Enquanto isso, você pode:
            </h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Preparar suas melhores fotos</li>
              <li>• Pensar no que escrever no seu perfil</li>
              <li>• Definir suas expectativas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 