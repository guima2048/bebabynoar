'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { 
  Crown, 
  Check, 
  X, 
  Eye, 
  Star,
  Heart,
  MessageCircle,
  Users,
  Shield
} from 'lucide-react'

interface Plan {
  id: string
  name: string
  price: number
  originalPrice?: number
  period: 'month' | 'year'
  features: string[]
  popular?: boolean
  stripePriceId: string
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Básico',
    price: 0,
    period: 'month',
    features: [
      'Perfil básico',
      'Busca limitada',
      '5 mensagens por dia',
      'Visualizações básicas'
    ],
    stripePriceId: ''
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 29.90,
    period: 'month',
    features: [
      'Perfil destacado',
      'Busca ilimitada',
      'Mensagens ilimitadas',
      'Ver quem me visualizou',
      'Fotos privadas',
      'Filtros avançados',
      'Prioridade no suporte'
    ],
    popular: true,
    stripePriceId: 'price_premium_monthly'
  },
  {
    id: 'premium-yearly',
    name: 'Premium Anual',
    price: 299.90,
    originalPrice: 358.80,
    period: 'year',
    features: [
      'Todas as funcionalidades Premium',
      '17% de desconto',
      'Acesso antecipado a novos recursos',
      'Suporte prioritário 24/7',
      'Eventos exclusivos'
    ],
    stripePriceId: 'price_premium_yearly'
  }
]

export default function PremiumPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [showFeatures, setShowFeatures] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
  }, [user, authLoading, router])

  useEffect(() => {
    // Garante fundo escuro no body e html apenas nesta página
    document.body.style.background = '#18181b';
    document.documentElement.style.background = '#18181b';
    return () => {
      document.body.style.background = '';
      document.documentElement.style.background = '';
    };
  }, []);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para assinar')
      router.push('/login')
      return
    }

    const plan = plans.find(p => p.id === planId)
    if (!plan || plan.price === 0) {
      toast.error('Plano inválido')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          stripePriceId: plan.stripePriceId,
          userId: user.id
        })
      })

      const data = await response.json()

      if (response.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        toast.error(data.error || 'Erro ao processar pagamento')
      }
    } catch (error) {
      toast.error('Erro ao processar pagamento')
    } finally {
      setLoading(false)
    }
  }

  const getDiscountPercentage = (plan: Plan) => {
    if (!plan.originalPrice) return 0
    return Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100)
  }

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 bg-[#18181b] min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center bg-[#18181b] min-h-screen text-white">
        <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
        <p className="mb-6">Você precisa estar logado para acessar os planos premium</p>
        <Link href="/login" className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors">
          Fazer Login
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 bg-[#18181b] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-white">Planos Premium</h1>
          </div>
          <Link
            href="/profile"
            className="text-gray-400 hover:text-pink-500 transition-colors"
          >
            Voltar ao Perfil
          </Link>
        </div>
        <p className="text-gray-400">Desbloqueie todo o potencial da plataforma</p>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-pink-600/20 via-purple-600/20 to-indigo-700/20 rounded-lg p-8 mb-8 border border-gray-700">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Desbloqueie Todo o Potencial
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-gray-300">
            Conecte-se com pessoas incríveis e tenha experiências únicas
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="px-4 py-2 bg-pink-600/20 text-pink-300 rounded-full border border-pink-600/30">
              💎 Perfil Destacado
            </span>
            <span className="px-4 py-2 bg-purple-600/20 text-purple-300 rounded-full border border-purple-600/30">
              🔍 Busca Ilimitada
            </span>
            <span className="px-4 py-2 bg-blue-600/20 text-blue-300 rounded-full border border-blue-600/30">
              💬 Mensagens Ilimitadas
            </span>
            <span className="px-4 py-2 bg-green-600/20 text-green-300 rounded-full border border-green-600/30">
              👁️ Ver Quem Me Visualizou
            </span>
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-white mb-4">
            Escolha Seu Plano
          </h3>
          <p className="text-xl text-gray-400">
            Comece grátis e atualize quando quiser
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-[#232326] rounded-lg border-2 overflow-hidden ${
                plan.popular
                  ? 'border-pink-500 scale-105'
                  : 'border-gray-700 hover:border-pink-500/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-pink-500 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Mais Popular
                  </div>
                </div>
              )}

              <div className="p-6">
                <div className="text-center mb-6">
                  <h4 className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h4>
                  <div className="mb-4">
                    {plan.price === 0 ? (
                      <span className="text-3xl font-bold text-white">Grátis</span>
                    ) : (
                      <div>
                        <span className="text-3xl font-bold text-white">
                          R$ {plan.price.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-gray-400">
                          /{plan.period === 'month' ? 'mês' : 'ano'}
                        </span>
                        {plan.originalPrice && (
                          <div className="mt-2">
                            <span className="text-lg text-gray-500 line-through">
                              R$ {plan.originalPrice.toFixed(2).replace('.', ',')}
                            </span>
                            <span className="ml-2 text-sm bg-green-600/20 text-green-400 px-2 py-1 rounded-full border border-green-600/30">
                              {getDiscountPercentage(plan)}% OFF
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading || plan.price === 0}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.price === 0
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-pink-600 text-white hover:bg-pink-700'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {loading ? 'Processando...' : plan.price === 0 ? 'Plano Atual' : 'Assinar Agora'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Comparison */}
      <div className="bg-[#232326] rounded-lg p-6 border border-gray-700">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-white mb-4">
            Comparação Detalhada
          </h3>
          <button
            onClick={() => setShowFeatures(!showFeatures)}
            className="flex items-center space-x-2 mx-auto px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            {showFeatures ? <X className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showFeatures ? 'Ocultar' : 'Ver'} comparação completa</span>
          </button>
        </div>

        {showFeatures && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-4 px-6 font-semibold text-white">Funcionalidade</th>
                  <th className="text-center py-4 px-6 font-semibold text-white">Básico</th>
                  <th className="text-center py-4 px-6 font-semibold text-white">Premium</th>
                  <th className="text-center py-4 px-6 font-semibold text-white">Premium Anual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                <tr>
                  <td className="py-4 px-6 font-medium text-white">Perfil</td>
                  <td className="py-4 px-6 text-center text-gray-400">Básico</td>
                  <td className="py-4 px-6 text-center text-green-400 font-semibold">Destacado</td>
                  <td className="py-4 px-6 text-center text-green-400 font-semibold">Destacado</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-white">Busca</td>
                  <td className="py-4 px-6 text-center text-gray-400">Limitada</td>
                  <td className="py-4 px-6 text-center text-green-400 font-semibold">Ilimitada</td>
                  <td className="py-4 px-6 text-center text-green-400 font-semibold">Ilimitada</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-white">Mensagens</td>
                  <td className="py-4 px-6 text-center text-gray-400">5/dia</td>
                  <td className="py-4 px-6 text-center text-green-400 font-semibold">Ilimitadas</td>
                  <td className="py-4 px-6 text-center text-green-400 font-semibold">Ilimitadas</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-white">Visualizações</td>
                  <td className="py-4 px-6 text-center text-gray-400">Básicas</td>
                  <td className="py-4 px-6 text-center text-green-400 font-semibold">Avançadas</td>
                  <td className="py-4 px-6 text-center text-green-400 font-semibold">Avançadas</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-white">Fotos Privadas</td>
                  <td className="py-4 px-6 text-center text-red-400">✗</td>
                  <td className="py-4 px-6 text-center text-green-400 font-semibold">✓</td>
                  <td className="py-4 px-6 text-center text-green-400 font-semibold">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-white">Quem Me Visualizou</td>
                  <td className="py-4 px-6 text-center text-red-400">✗</td>
                  <td className="py-4 px-6 text-center text-green-400 font-semibold">✓</td>
                  <td className="py-4 px-6 text-center text-green-400 font-semibold">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-white">Filtros Avançados</td>
                  <td className="py-4 px-6 text-center text-red-400">✗</td>
                  <td className="py-4 px-6 text-center text-green-400 font-semibold">✓</td>
                  <td className="py-4 px-6 text-center text-green-400 font-semibold">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-white">Suporte</td>
                  <td className="py-4 px-6 text-center text-gray-400">Básico</td>
                  <td className="py-4 px-6 text-center text-green-400 font-semibold">Prioritário</td>
                  <td className="py-4 px-6 text-center text-green-400 font-semibold">24/7</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 