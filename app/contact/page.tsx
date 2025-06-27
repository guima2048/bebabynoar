'use client'

import React, { useState } from 'react'
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simular envio do formulário
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.')
      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      toast.error('Erro ao enviar mensagem. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Mensagem Enviada!</h1>
          <p className="text-xl text-gray-600 mb-8">
            Obrigado por entrar em contato conosco. Nossa equipe responderá em até 24 horas.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-pink-700 transition-colors"
          >
            Enviar Nova Mensagem
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Entre em Contato</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Tem dúvidas, sugestões ou precisa de ajuda? Nossa equipe está aqui para você.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Informações de Contato */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Informações de Contato</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">E-mail</h3>
                <p className="text-gray-600 mb-2">contato@bebaby.app</p>
                <p className="text-gray-600">suporte@bebaby.app</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Telefone</h3>
                <p className="text-gray-600 mb-2">+55 (11) 99999-9999</p>
                <p className="text-gray-600">WhatsApp disponível</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Endereço</h3>
                <p className="text-gray-600 mb-2">São Paulo, SP - Brasil</p>
                <p className="text-gray-600">Empresa 100% digital</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Horário de Atendimento</h3>
                <p className="text-gray-600 mb-2">Segunda a Sexta: 9h às 18h</p>
                <p className="text-gray-600">Suporte 24/7 para emergências</p>
              </div>
            </div>
          </div>

          {/* Tipos de Suporte */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Tipos de Suporte</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Suporte Técnico</h4>
                <p className="text-gray-600 text-sm">
                  Problemas com login, cadastro, funcionalidades do app
                </p>
                <p className="text-pink-600 text-sm font-medium mt-2">
                  suporte@bebaby.app
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Pagamentos</h4>
                <p className="text-gray-600 text-sm">
                  Dúvidas sobre assinaturas, reembolsos, métodos de pagamento
                </p>
                <p className="text-pink-600 text-sm font-medium mt-2">
                  pagamentos@bebaby.app
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Denúncias</h4>
                <p className="text-gray-600 text-sm">
                  Comportamento inadequado, perfis falsos, assédio
                </p>
                <p className="text-pink-600 text-sm font-medium mt-2">
                  denuncias@bebaby.app
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Parcerias</h4>
                <p className="text-gray-600 text-sm">
                  Oportunidades de negócio, colaborações, eventos
                </p>
                <p className="text-pink-600 text-sm font-medium mt-2">
                  parcerias@bebaby.app
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário de Contato */}
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-6 h-6 text-pink-600" />
            <h2 className="text-2xl font-bold text-gray-900">Envie uma Mensagem</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-mail *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Assunto *
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">Selecione um assunto</option>
                <option value="suporte">Suporte Técnico</option>
                <option value="pagamento">Pagamentos</option>
                <option value="denuncia">Denúncia</option>
                <option value="sugestao">Sugestão</option>
                <option value="parceria">Parceria</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                placeholder="Descreva sua dúvida, sugestão ou problema..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Enviar Mensagem
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Resposta Rápida:</strong> Nossa equipe responde em até 24 horas em dias úteis.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Rápido */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Perguntas Frequentes</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Como funciona o Bebaby App?</h3>
            <p className="text-gray-600 text-sm">
              O Bebaby App conecta Sugar Babies e Sugar Daddies de forma segura. 
              Crie seu perfil, explore outros usuários e inicie conversas.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-2">É seguro usar o app?</h3>
            <p className="text-gray-600 text-sm">
              Sim! Implementamos medidas rigorosas de segurança, verificação de perfis 
              e moderação 24/7 para garantir sua segurança.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Como cancelar minha assinatura?</h3>
            <p className="text-gray-600 text-sm">
              Entre em contato conosco em pagamentos@bebaby.app ou através do 
              painel de controle da sua conta.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Como denunciar um usuário?</h3>
            <p className="text-gray-600 text-sm">
              Use o botão &quot;Denunciar&quot; no perfil ou mensagem do usuário, 
              ou envie um e-mail para denuncias@bebaby.app.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 