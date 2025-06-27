'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Mail, Phone, MessageCircle, FileText, Shield, Heart, Users, Settings } from 'lucide-react'
import Link from 'next/link'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  {
    question: "Como criar uma conta no Bebaby App?",
    answer: "Para criar uma conta, clique em 'Cadastrar' na página inicial, preencha seus dados pessoais, adicione fotos do seu perfil e aguarde a verificação. É simples e rápido!",
    category: "conta"
  },
  {
    question: "Como funciona o sistema de mensagens?",
    answer: "Após se conectar com alguém, você pode enviar mensagens ilimitadas. Usuários Premium têm acesso a recursos avançados como mensagens de voz e vídeo.",
    category: "mensagens"
  },
  {
    question: "O que são os planos Premium?",
    answer: "Os planos Premium oferecem recursos exclusivos como ver quem visitou seu perfil, mensagens ilimitadas, filtros avançados e destaque no app. Há diferentes opções para atender suas necessidades.",
    category: "premium"
  },
  {
    question: "Como denunciar um usuário inadequado?",
    answer: "Para denunciar um usuário, acesse seu perfil e clique no botão de denúncia. Nossa equipe de moderação analisará o caso em até 24 horas.",
    category: "seguranca"
  },
  {
    question: "Como bloquear um usuário?",
    answer: "Para bloquear um usuário, acesse seu perfil e clique em 'Bloquear'. Usuários bloqueados não poderão mais entrar em contato com você.",
    category: "seguranca"
  },
  {
    question: "Como editar meu perfil?",
    answer: "Acesse 'Meu Perfil' e clique em 'Editar'. Você pode atualizar suas informações, fotos e preferências a qualquer momento.",
    category: "conta"
  },
  {
    question: "Como funciona o sistema de verificação?",
    answer: "Enviamos um link de verificação para seu email. Clique no link para confirmar sua conta e desbloquear todos os recursos.",
    category: "conta"
  },
  {
    question: "Como recuperar minha senha?",
    answer: "Na tela de login, clique em 'Esqueci minha senha' e siga as instruções. Você receberá um email com um link para redefinir sua senha.",
    category: "conta"
  },
  {
    question: "O app é seguro?",
    answer: "Sim! Utilizamos criptografia de ponta a ponta, moderação ativa e verificações de identidade para garantir sua segurança e privacidade.",
    category: "seguranca"
  },
  {
    question: "Como cancelar minha assinatura Premium?",
    answer: "Acesse 'Configurações' > 'Assinatura' e clique em 'Cancelar'. Sua assinatura permanecerá ativa até o final do período pago.",
    category: "premium"
  }
]

const categories = [
  { id: 'all', label: 'Todas', icon: FileText },
  { id: 'conta', label: 'Conta', icon: Users },
  { id: 'mensagens', label: 'Mensagens', icon: MessageCircle },
  { id: 'premium', label: 'Premium', icon: Heart },
  { id: 'seguranca', label: 'Segurança', icon: Shield }
]

export default function Help() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [openItems, setOpenItems] = useState<number[]>([])

  const filteredFAQ = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory)

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Central de Ajuda
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Encontre respostas para suas dúvidas e aprenda a usar todos os recursos do Bebaby App
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Categorias */}
            <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Categorias</h2>
              <div className="space-y-2">
                {categories.map(category => {
                  const Icon = category.icon
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-pink-100 text-pink-700 border border-pink-200'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{category.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Contato */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Precisa de Ajuda?</h2>
              <p className="text-gray-600 mb-4">
                Nossa equipe está aqui para ajudar você 24/7
              </p>
              
              <div className="space-y-3">
                <Link
                  href="/contact"
                  className="flex items-center gap-3 p-3 rounded-lg bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span className="font-medium">Enviar Email</span>
                </Link>
                
                <a
                  href="tel:+5511999999999"
                  className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span className="font-medium">Ligar Agora</span>
                </a>
                
                <Link
                  href="/chat"
                  className="flex items-center gap-3 p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">Chat ao Vivo</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-2">
            {/* FAQ */}
            <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Perguntas Frequentes
              </h2>
              
              <div className="space-y-4">
                {filteredFAQ.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleItem(index)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-900 pr-4">
                        {item.question}
                      </span>
                      {openItems.includes(index) ? (
                        <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    
                    {openItems.includes(index) && (
                      <div className="px-4 pb-4">
                        <p className="text-gray-600 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Guias Rápidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primeiros Passos */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Primeiros Passos</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <p className="text-gray-600 text-sm">
                      Crie sua conta com email e senha
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <p className="text-gray-600 text-sm">
                      Complete seu perfil com fotos e informações
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <p className="text-gray-600 text-sm">
                      Explore perfis e comece a conversar
                    </p>
                  </div>
                </div>
              </div>

              {/* Dicas de Segurança */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Dicas de Segurança</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-600 text-sm">
                      Nunca compartilhe informações pessoais sensíveis
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-600 text-sm">
                      Sempre se encontrem em locais públicos
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-600 text-sm">
                      Denuncie comportamentos inadequados
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Links Úteis */}
            <div className="mt-8 bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Links Úteis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/terms"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Termos de Uso</span>
                </Link>
                <Link
                  href="/privacy"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Shield className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Política de Privacidade</span>
                </Link>
                <Link
                  href="/safety"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Shield className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Dicas de Segurança</span>
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Mail className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Fale Conosco</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 