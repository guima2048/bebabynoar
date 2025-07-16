'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useCSRF } from '@/hooks/useCSRF'

interface SMTPConfig {
  host: string
  port: number
  user: string
  pass: string
  token: string
  from: string
}

interface EmailTemplate {
  id: string
  slug: string
  name: string
  subject: string
  body: string
  enabled: boolean
  testEmail: string
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: '1',
    slug: 'email-confirmation',
    name: 'Confirmação de E-mail',
    subject: 'Confirme seu e-mail - BeBaby',
    body: 'Olá {{nome}},\n\nObrigado por se cadastrar no BeBaby! Para ativar sua conta, clique no link abaixo:\n\n{{link_confirmacao}}\n\nSe você não criou esta conta, ignore este e-mail.\n\nAtenciosamente,\nEquipe BeBaby',
    enabled: true,
    testEmail: ''
  },
  {
    id: '2',
    slug: 'welcome',
    name: 'Bem-vindo ao site',
    subject: 'Bem-vindo ao BeBaby! 🍯',
    body: 'Olá {{nome}},\n\nSeja bem-vindo(a) ao BeBaby! Sua conta foi ativada com sucesso.\n\nAgora você pode:\n• Completar seu perfil\n• Explorar outros usuários\n• Enviar mensagens\n• Favoritar perfis\n\nComece sua jornada agora: {{link_site}}\n\nAtenciosamente,\nEquipe BeBaby',
    enabled: true,
    testEmail: ''
  },
  {
    id: '3',
    slug: 'newsletter',
    name: 'Newsletter',
    subject: 'BeBaby - Suas novidades da semana',
    body: 'Olá {{nome}},\n\nConfira as novidades desta semana no BeBaby:\n\n{{conteudo_newsletter}}\n\nNão perca as oportunidades de encontrar seu match!\n\nAtenciosamente,\nEquipe BeBaby',
    enabled: false,
    testEmail: ''
  },
  {
    id: '4',
    slug: 'message-received',
    name: 'Mensagem recebida',
    subject: 'Você recebeu uma nova mensagem no BeBaby',
    body: 'Olá {{nome}},\n\n{{remetente}} enviou uma mensagem para você!\n\nMensagem: {{mensagem_preview}}\n\nAcesse sua caixa de entrada para responder: {{link_mensagens}}\n\nAtenciosamente,\nEquipe BeBaby',
    enabled: true,
    testEmail: ''
  },
  {
    id: '5',
    slug: 'profile-favorited',
    name: 'Perfil favoritado',
    subject: 'Alguém favoritou seu perfil no BeBaby!',
    body: 'Olá {{nome}},\n\n{{favoritador}} favoritou seu perfil!\n\nQue tal dar uma olhada no perfil dessa pessoa?\n\n{{link_perfil_favoritador}}\n\nAtenciosamente,\nEquipe BeBaby',
    enabled: true,
    testEmail: ''
  },
  {
    id: '6',
    slug: 'profile-viewed',
    name: 'Perfil visualizado',
    subject: 'Alguém visualizou seu perfil no BeBaby',
    body: 'Olá {{nome}},\n\n{{visualizador}} visualizou seu perfil!\n\nQue tal dar uma olhada no perfil dessa pessoa?\n\n{{link_perfil_visualizador}}\n\nAtenciosamente,\nEquipe BeBaby',
    enabled: false,
    testEmail: ''
  },
  {
    id: '7',
    slug: 'account-banned',
    name: 'Banimento de conta',
    subject: 'Sua conta foi suspensa - BeBaby',
    body: 'Olá {{nome}},\n\nSua conta foi suspensa temporariamente devido a violações dos nossos termos de uso.\n\nMotivo: {{motivo_banimento}}\n\nDuração: {{duracao_banimento}}\n\nSe você acredita que isso foi um erro, entre em contato conosco.\n\nAtenciosamente,\nEquipe BeBaby',
    enabled: true,
    testEmail: ''
  },
  {
    id: '8',
    slug: 'account-deleted',
    name: 'Exclusão de conta',
    subject: 'Sua conta foi excluída - BeBaby',
    body: 'Olá {{nome}},\n\nSua conta foi excluída conforme solicitado.\n\nTodos os seus dados foram removidos permanentemente do nosso sistema.\n\nSe você mudou de ideia, você pode criar uma nova conta a qualquer momento.\n\nAtenciosamente,\nEquipe BeBaby',
    enabled: true,
    testEmail: ''
  }
]

export default function AdminEmailsPage() {
  const [smtpConfig, setSmtpConfig] = useState<SMTPConfig>({
    host: 'smtplw.com.br',
    port: 587,
    user: '',
    pass: '',
    token: '',
    from: 'BeBaby <contato@bebaby.app>'
  })
  
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates)
  const [loading, setLoading] = useState(false)
  const [savingConfig, setSavingConfig] = useState(false)
  const [savingTemplates, setSavingTemplates] = useState(false)
  const [sendingTest, setSendingTest] = useState<string | null>(null)
  const { csrfToken } = useCSRF()

  useEffect(() => {
    loadConfig()
    loadTemplates()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/admin/emails/config')
      if (response.ok) {
        const data = await response.json()
        setSmtpConfig(data)
      }
    } catch (error) {
      console.error('Erro ao carregar configuração SMTP:', error)
    }
  }

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/admin/emails/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Erro ao carregar templates:', error)
    }
  }

  const handleSaveConfig = async () => {
    if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.token || !smtpConfig.from) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setSavingConfig(true)
    try {
      const response = await fetch('/api/admin/emails/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRF-Token': csrfToken })
        },
        body: JSON.stringify(smtpConfig)
      })

      if (response.ok) {
        toast.success('Configuração salva com sucesso!')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erro ao salvar configuração')
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
      toast.error('Erro ao salvar configuração')
    } finally {
      setSavingConfig(false)
    }
  }

  const handleSaveTemplate = async (template: EmailTemplate) => {
    setSavingTemplates(true)
    try {
      const response = await fetch('/api/admin/emails/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRF-Token': csrfToken })
        },
        body: JSON.stringify(template)
      })

      if (response.ok) {
        toast.success(`Template "${template.name}" salvo com sucesso!`)
        setTemplates(prev => prev.map(t => t.id === template.id ? template : t))
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erro ao salvar template')
      }
    } catch (error) {
      console.error('Erro ao salvar template:', error)
      toast.error('Erro ao salvar template')
    } finally {
      setSavingTemplates(false)
    }
  }

  const handleSendTest = async (template: EmailTemplate) => {
    if (!template.testEmail) {
      toast.error('Digite um e-mail para teste')
      return
    }

    setSendingTest(template.id)
    try {
      const response = await fetch('/api/admin/emails/send-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRF-Token': csrfToken })
        },
        body: JSON.stringify({
          templateSlug: template.slug,
          testEmail: template.testEmail
        })
      })

      if (response.ok) {
        toast.success(`E-mail de teste enviado para ${template.testEmail}!`)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erro ao enviar e-mail de teste')
      }
    } catch (error) {
      console.error('Erro ao enviar e-mail de teste:', error)
      toast.error('Erro ao enviar e-mail de teste')
    } finally {
      setSendingTest(null)
    }
  }

  const updateTemplate = (id: string, field: keyof EmailTemplate, value: any) => {
    setTemplates(prev => prev.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ))
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configuração de E-mails</h1>
        <p className="text-gray-600 mt-2">
          Configure o sistema de e-mails automáticos da plataforma
        </p>
      </div>

      {/* Configuração SMTP */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          🔐 Configuração da API de E-mail (Locaweb)
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Servidor SMTP
              </label>
              <input
                type="text"
                value={smtpConfig.host}
                onChange={(e) => setSmtpConfig(prev => ({ ...prev, host: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="smtplw.com.br"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Porta
              </label>
              <input
                type="number"
                value={smtpConfig.port}
                onChange={(e) => setSmtpConfig(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="587"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuário SMTP *
            </label>
            <input
              type="email"
              value={smtpConfig.user}
              onChange={(e) => setSmtpConfig(prev => ({ ...prev, user: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="seu-email@dominio.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha ou Token SMTP *
            </label>
            <input
              type="password"
              value={smtpConfig.pass}
              onChange={(e) => setSmtpConfig(prev => ({ ...prev, pass: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="Sua senha ou token"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              x-auth-token (Locaweb) *
            </label>
            <input
              type="password"
              value={smtpConfig.token}
              onChange={(e) => setSmtpConfig(prev => ({ ...prev, token: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="Token de autenticação da API Locaweb"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remetente padrão *
            </label>
            <input
              type="text"
              value={smtpConfig.from}
              onChange={(e) => setSmtpConfig(prev => ({ ...prev, from: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="BeBaby <contato@bebaby.app>"
              required
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSaveConfig}
            disabled={savingConfig}
            className="w-full bg-pink-600 text-white py-3 px-6 rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {savingConfig ? 'Salvando...' : 'Salvar Configuração'}
          </button>
        </div>
      </div>

      {/* Modelos de E-mails */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          📧 Modelos de E-mails Automáticos
        </h2>
        
        <div className="space-y-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-gray-50 rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={template.enabled}
                      onChange={(e) => updateTemplate(template.id, 'enabled', e.target.checked)}
                      className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Ativo</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assunto
                  </label>
                  <input
                    type="text"
                    value={template.subject}
                    onChange={(e) => updateTemplate(template.id, 'subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Assunto do e-mail"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Corpo do E-mail
                  </label>
                  <textarea
                    value={template.body}
                    onChange={(e) => updateTemplate(template.id, 'body', e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-vertical"
                    placeholder="Conteúdo do e-mail (use {{variavel}} para variáveis dinâmicas)"
                  />
                                     <p className="text-xs text-gray-500 mt-1">
                     Variáveis disponíveis: {'{{nome}}'}, {'{{email}}'}, {'{{link_confirmacao}}'}, etc.
                   </p>
                </div>

                <div className="flex items-end space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-mail para teste
                    </label>
                    <input
                      type="email"
                      value={template.testEmail}
                      onChange={(e) => updateTemplate(template.id, 'testEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  
                  <button
                    onClick={() => handleSendTest(template)}
                    disabled={!template.testEmail || sendingTest === template.id}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sendingTest === template.id ? 'Enviando...' : 'Enviar teste'}
                  </button>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleSaveTemplate(template)}
                    disabled={savingTemplates}
                    className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {savingTemplates ? 'Salvando...' : 'Salvar modelo'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 