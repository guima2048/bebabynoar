'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { Check, Star, Crown, Zap, Heart, Shield, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const PAYMENT_LINK = 'https://paypal.me/seuconta' // Troque pelo seu link real
const SUPPORT_EMAIL = 'suporte@bebabyapp.com' // Troque pelo seu e-mail real

const plans = [
  {
    name: 'Básico',
    price: 'Grátis',
    period: '',
    description: 'Acesso básico à plataforma',
    features: [
      'Criar perfil completo',
      'Explorar perfis',
      'Enviar até 5 mensagens por dia',
      'Galeria pública de fotos',
      'Suporte por e-mail'
    ],
    popular: false,
    cta: 'Já está ativo',
    link: '#',
    disabled: true
  },
  {
    name: 'Premium',
    price: 'R$ 29,90',
    period: '/mês',
    description: 'Experiência completa e sem limites',
    features: [
      'Mensagens ilimitadas',
      'Ver quem visitou seu perfil',
      'Galeria privada ilimitada',
      'Perfil em destaque',
      'Filtros avançados de busca',
      'Suporte prioritário',
      'Sem anúncios',
      'Acesso antecipado a novos recursos'
    ],
    popular: true,
    cta: 'Assinar Agora',
    link: PAYMENT_LINK,
    disabled: false
  },
  {
    name: 'VIP',
    price: 'R$ 99,90',
    period: '/mês',
    description: 'Máxima exclusividade e benefícios',
    features: [
      'Todos os benefícios Premium',
      'Perfil sempre no topo das buscas',
      'Consultoria personalizada',
      'Eventos exclusivos',
      'Concierge 24/7',
      'Verificação de perfil',
      'Relatórios detalhados de interação',
      'Acesso a eventos VIP'
    ],
    popular: false,
    cta: 'Assinar VIP',
    link: 'https://checkout.stripe.com/pay/bebaby-vip',
    disabled: false
  }
]

const benefits = [
  {
    icon: Heart,
    title: 'Conexões Reais',
    description: 'Encontre relacionamentos genuínos e duradouros com pessoas que compartilham seus objetivos.'
  },
  {
    icon: Shield,
    title: 'Segurança Total',
    description: 'Perfis verificados e ambiente seguro para sua privacidade e tranquilidade.'
  },
  {
    icon: Users,
    title: 'Comunidade Exclusiva',
    description: 'Acesse uma comunidade selecionada de pessoas interessantes e qualificadas.'
  },
  {
    icon: Zap,
    title: 'Resultados Rápidos',
    description: 'Algoritmo inteligente que conecta você com as pessoas mais compatíveis.'
  }
]

export default function PremiumPage() {
  const { user } = useAuth()
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { return }
    loadPremiumStatus()
  }, [user])

  const loadPremiumStatus = async () => {
    if (!user) { return }
    setLoading(true)
    try {
      const userDoc = await getDoc(doc(db, 'users', user.id))
      if (userDoc.exists()) {
        setIsPremium(!!userDoc.data().premium)
      }
    } catch (error) {
      toast.error('Erro ao carregar status premium')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Crown className="w-8 h-8 text-primary-600" />
              <h1 className="text-4xl font-bold text-secondary-900">Seja Premium</h1>
            </div>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Desbloqueie todo o potencial do Bebaby App e encontre conexões extraordinárias. 
              Escolha o plano ideal para seus objetivos.
            </p>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative card ${
                plan.popular 
                  ? 'ring-2 ring-primary-500 shadow-xl scale-105' 
                  : 'hover:shadow-lg transition-shadow'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-secondary-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-primary-600">{plan.price}</span>
                  <span className="text-secondary-600">{plan.period}</span>
                </div>
                <p className="text-secondary-600">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-secondary-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="text-center">
                {plan.disabled ? (
                  <button className="w-full btn-secondary cursor-not-allowed" disabled>
                    {plan.cta}
                  </button>
                ) : (
                  <a
                    href={plan.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full inline-flex items-center justify-center gap-2"
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Payment Instructions */}
        <div className="mt-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">
              Como funciona o pagamento?
            </h2>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <ol className="text-left space-y-4">
                <li className="flex items-start gap-3">
                  <span className="bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">1</span>
                  <div>
                    <p className="font-semibold">Escolha seu plano</p>
                    <p className="text-secondary-600">Clique em &quot;Assinar Agora&quot; para acessar o link de pagamento seguro.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">2</span>
                  <div>
                    <p className="font-semibold">Faça o pagamento</p>
                    <p className="text-secondary-600">Complete o pagamento através do PayPal ou Stripe.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">3</span>
                  <div>
                    <p className="font-semibold">Envie o comprovante</p>
                    <p className="text-secondary-600">
                      Após o pagamento, envie o comprovante para{' '}
                      <a href="mailto:pagamentos@bebaby.app" className="text-primary-600 hover:underline">
                        pagamentos@bebaby.app
                      </a>
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">4</span>
                  <div>
                    <p className="font-semibold">Ativação imediata</p>
                    <p className="text-secondary-600">Seu status premium será ativado em até 24 horas.</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-secondary-900 mb-12">
            Por que escolher o Bebaby Premium?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">{benefit.title}</h3>
                <p className="text-secondary-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-secondary-900 mb-12">
            Perguntas Frequentes
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="card">
              <h3 className="font-semibold text-lg mb-2">Posso cancelar minha assinatura?</h3>
              <p className="text-secondary-600">
                Sim! Você pode cancelar a qualquer momento. Entre em contato conosco e faremos o cancelamento imediatamente.
              </p>
            </div>
            <div className="card">
              <h3 className="font-semibold text-lg mb-2">O pagamento é seguro?</h3>
              <p className="text-secondary-600">
                Absolutamente! Utilizamos PayPal e Stripe, as plataformas mais seguras do mundo para pagamentos online.
              </p>
            </div>
            <div className="card">
              <h3 className="font-semibold text-lg mb-2">Quando meu status premium será ativado?</h3>
              <p className="text-secondary-600">
                Após o envio do comprovante de pagamento, seu status será ativado em até 24 horas.
              </p>
            </div>
            <div className="card">
              <h3 className="font-semibold text-lg mb-2">Posso mudar de plano?</h3>
              <p className="text-secondary-600">
                Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="mt-16 text-center">
          <div className="bg-primary-600 text-white rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-4">Pronto para encontrar sua conexão perfeita?</h2>
            <p className="text-xl mb-6 opacity-90">
              Junte-se aos milhares de usuários premium que já encontraram relacionamentos extraordinários.
            </p>
            <a
              href="https://paypal.me/bebabyapp"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
            >
              Começar Agora
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="text-center mt-8">
          {loading ? (
            <span className="text-gray-500">Carregando status...</span>
          ) : isPremium ? (
            <span className="text-green-600 font-bold">Você já é usuário Premium!</span>
          ) : (
            <span className="text-gray-700">Sua conta ainda não é Premium.</span>
          )}
        </div>
      </div>
    </div>
  )
} 