'use client'

import React from 'react'
import { MessageCircle, Users, Search, Crown, Shield, Heart, TrendingUp } from 'lucide-react'

interface MessagesOnboardingProps {
  userType?: string
}

export default function MessagesOnboarding({ userType }: MessagesOnboardingProps) {
  const tips = [
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Explore perfis',
      description: 'Descubra pessoas interessantes e inicie conversas'
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: 'Seja autêntico',
      description: 'Mantenha conversas genuínas e respeitosas'
    },
    {
      icon: <Crown className="w-5 h-5" />,
      title: 'Considere o Premium',
      description: 'Desbloqueie recursos exclusivos para melhor experiência'
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Mantenha-se seguro',
      description: 'Sempre encontre pessoas em locais públicos'
    }
  ]

  const quickActions = [
    {
      title: 'Explorar usuários',
      description: 'Encontre pessoas interessantes',
      icon: <Search className="w-5 h-5" />,
      action: () => window.location.href = '/explore',
      primary: true
    },
    {
      title: 'Buscar pessoas',
      description: 'Filtre por localização e interesses',
      icon: <Users className="w-5 h-5" />,
      action: () => window.location.href = '/search',
      primary: false
    },
    {
      title: 'Verificar Premium',
      description: 'Conheça os benefícios exclusivos',
      icon: <Crown className="w-5 h-5" />,
      action: () => window.location.href = '/premium',
      primary: false
    }
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-pink-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Bem-vindo às suas mensagens!
        </h2>
        <p className="text-gray-600">
          {userType === 'sugar_daddy' 
            ? 'Conecte-se com sugar babies interessantes'
            : 'Conecte-se com sugar daddies generosos'
          }
        </p>
      </div>

      {/* Tips */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-pink-600" />
          Dicas para começar
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-pink-600 mt-0.5">
                {tip.icon}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">{tip.title}</h4>
                <p className="text-gray-600 text-xs">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-600" />
          Ações rápidas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`p-4 rounded-lg border transition-all duration-200 hover:scale-105 ${
                action.primary
                  ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white border-pink-600 hover:from-pink-600 hover:to-pink-700'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300 hover:bg-pink-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {action.icon}
                <span className="font-medium text-sm">{action.title}</span>
              </div>
              <p className={`text-xs ${action.primary ? 'text-pink-100' : 'text-gray-500'}`}>
                {action.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
} 