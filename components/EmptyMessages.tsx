'use client'

import React from 'react'
import { MessageCircle, Search, Filter, Users } from 'lucide-react'

interface EmptyMessagesProps {
  type: 'conversations' | 'messages'
  searchTerm?: string
  filter?: string
}

export default function EmptyMessages({ type, searchTerm, filter }: EmptyMessagesProps) {
  if (type === 'conversations') {
    if (searchTerm || filter !== 'all') {
      return (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma conversa encontrada
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? `Nenhuma conversa encontrada para "${searchTerm}"`
              : `Nenhuma conversa com o filtro "${filter}"`
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Limpar filtros
            </button>
            <button 
              onClick={() => window.location.href = '/explore'}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Explorar usuários
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="text-center py-12">
        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nenhuma conversa ainda
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Comece a conversar com outros usuários! Explore perfis e inicie novas conexões.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={() => window.location.href = '/explore'}
            className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium"
          >
            Explorar usuários
          </button>
          <button 
            onClick={() => window.location.href = '/search'}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Buscar pessoas
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center py-12">
      <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Nenhuma mensagem
      </h3>
      <p className="text-gray-600">
        Seja o primeiro a enviar uma mensagem!
      </p>
    </div>
  )
} 