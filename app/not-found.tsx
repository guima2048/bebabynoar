import React from 'react'
import Link from 'next/link'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md mx-auto text-center">
        {/* Ícone 404 */}
        <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-white text-3xl font-bold">404</span>
        </div>

        {/* Título */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Página não encontrada
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>

        {/* Sugestões */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            O que você pode fazer:
          </h2>
          
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-pink-600" />
              <span className="text-gray-700">Verificar se o endereço está correto</span>
            </div>
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700">Voltar para a página inicial</span>
            </div>
            <div className="flex items-center gap-3">
              <ArrowLeft className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Usar o botão voltar do navegador</span>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/" 
            className="bg-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-pink-700 transition-colors"
          >
            Página Inicial
          </Link>
          <Link 
            href="/explore" 
            className="border-2 border-pink-600 text-pink-600 px-8 py-3 rounded-xl font-semibold hover:bg-pink-50 transition-colors"
          >
            Explorar Perfis
          </Link>
        </div>

        {/* Links Úteis */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Links Úteis:</h3>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/about" className="text-pink-600 hover:underline">
              Sobre Nós
            </Link>
            <Link href="/contact" className="text-pink-600 hover:underline">
              Contato
            </Link>
            <Link href="/blog" className="text-pink-600 hover:underline">
              Blog
            </Link>
            <Link href="/help" className="text-pink-600 hover:underline">
              Ajuda
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 