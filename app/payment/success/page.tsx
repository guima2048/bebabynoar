import React from 'react'
import Link from 'next/link'
import { CheckCircle, Crown, Heart, Users, Zap } from 'lucide-react'

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Ícone de Sucesso */}
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>

        {/* Título */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Pagamento Aprovado!
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Parabéns! Você agora é um usuário Premium do Bebaby App.
        </p>

        {/* Benefícios Premium */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Seus Benefícios Premium
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Mensagens Ilimitadas</h3>
                <p className="text-gray-600 text-sm">
                  Envie quantas mensagens quiser sem restrições
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Ver Quem Visitou</h3>
                <p className="text-gray-600 text-sm">
                  Descubra quem visualizou seu perfil
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Perfil em Destaque</h3>
                <p className="text-gray-600 text-sm">
                  Seu perfil aparece primeiro nas buscas
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Filtros Avançados</h3>
                <p className="text-gray-600 text-sm">
                  Encontre pessoas mais compatíveis
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Próximos Passos */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-2xl font-semibold mb-4">Próximos Passos</h2>
          <div className="space-y-3 text-left max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-white text-pink-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <span>Complete seu perfil com fotos de qualidade</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-white text-pink-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <span>Explore perfis e envie mensagens</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-white text-pink-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <span>Conecte-se com pessoas interessantes</span>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/explore" 
            className="bg-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-pink-700 transition-colors"
          >
            Explorar Perfis
          </Link>
          <Link 
            href="/profile/edit" 
            className="border-2 border-pink-600 text-pink-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-pink-50 transition-colors"
          >
            Editar Perfil
          </Link>
        </div>

        {/* Informações Adicionais */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Um e-mail de confirmação foi enviado para sua caixa de entrada.
          </p>
          <p className="mt-2">
            Em caso de dúvidas, entre em contato conosco em{' '}
            <a href="mailto:suporte@bebaby.app" className="text-pink-600 hover:underline">
              suporte@bebaby.app
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Pagamento Aprovado - Bebaby App',
  description: 'Seu pagamento foi aprovado com sucesso! Bem-vindo ao Bebaby App Premium.',
} 