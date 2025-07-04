'use client'

import React from 'react'
import Link from 'next/link'
import { Shield, ArrowLeft, Users } from 'lucide-react'

export default function AccessDeniedPage() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#18181b] px-4">
      <div className="max-w-md mx-auto text-center">
        {/* Ícone */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-white mb-4">
          Acesso Restrito
        </h1>

        {/* Mensagem */}
        <p className="text-gray-300 mb-8 leading-relaxed">
          Este perfil não está disponível para o seu tipo de usuário. 
          Nossa plataforma conecta pessoas com interesses compatíveis.
        </p>

        {/* Botões */}
        <div className="space-y-4">
          <Link 
            href="/explore" 
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Explorar Perfis
          </Link>
          
          <Link 
            href="/search" 
            className="w-full bg-white/10 text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar à Busca
          </Link>
        </div>

        {/* Informação adicional */}
        <p className="text-xs text-gray-500 mt-8">
          Dica: Use os filtros de busca para encontrar perfis compatíveis com suas preferências.
        </p>
      </div>
    </div>
  )
} 