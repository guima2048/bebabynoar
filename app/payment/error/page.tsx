import React from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw, CreditCard, HelpCircle } from 'lucide-react'

export default function PaymentErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Ícone de Erro */}
        <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
          <AlertCircle className="w-12 h-12 text-white" />
        </div>

        {/* Título */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Erro no Pagamento
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Ocorreu um problema ao processar seu pagamento. Não se preocupe, você não foi cobrado.
        </p>

        {/* Possíveis Causas */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Possíveis Causas
          </h2>
          
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Problemas com o Cartão</h3>
                <p className="text-gray-600 text-sm">
                  Verifique se os dados do cartão estão corretos e se há limite disponível
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <RefreshCw className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Problemas de Conexão</h3>
                <p className="text-gray-600 text-sm">
                  Verifique sua conexão com a internet e tente novamente
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Bloqueio do Banco</h3>
                <p className="text-gray-600 text-sm">
                  Alguns bancos podem bloquear transações por segurança
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Soluções */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-2xl font-semibold mb-4">O que fazer agora?</h2>
          <div className="space-y-3 text-left max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-white text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <span>Verifique os dados do seu cartão</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-white text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <span>Tente usar outro método de pagamento</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-white text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <span>Entre em contato com nosso suporte</span>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/premium" 
            className="bg-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-pink-700 transition-colors"
          >
            Tentar Novamente
          </Link>
          <Link 
            href="/contact" 
            className="border-2 border-pink-600 text-pink-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-pink-50 transition-colors"
          >
            Falar com Suporte
          </Link>
        </div>

        {/* Métodos de Pagamento Alternativos */}
        <div className="mt-8 bg-white rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Métodos de Pagamento Alternativos
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-lg font-bold text-gray-600">PIX</span>
              </div>
              <span className="text-sm text-gray-600">PIX</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-lg font-bold text-gray-600">PP</span>
              </div>
              <span className="text-sm text-gray-600">PayPal</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-lg font-bold text-gray-600">CD</span>
              </div>
              <span className="text-sm text-gray-600">Cartão de Débito</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-lg font-bold text-gray-600">CC</span>
              </div>
              <span className="text-sm text-gray-600">Cartão de Crédito</span>
            </div>
          </div>
        </div>

        {/* Informações de Contato */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Precisa de ajuda? Entre em contato conosco:
          </p>
          <div className="mt-2 space-y-1">
            <p>
              <strong>E-mail:</strong>{' '}
              <a href="mailto:pagamentos@bebaby.app" className="text-pink-600 hover:underline">
                pagamentos@bebaby.app
              </a>
            </p>
            <p>
              <strong>WhatsApp:</strong> +55 (11) 99999-9999
            </p>
            <p>
              <strong>Horário:</strong> Segunda a Sexta, 9h às 18h
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Erro no Pagamento - Bebaby App',
  description: 'Ocorreu um erro no processamento do seu pagamento. Entre em contato conosco para obter ajuda.',
} 