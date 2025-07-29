'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface EmailTemplate {
  id: string
  name: string
  slug: string
  templateId: string
  enabled: boolean
  testEmail: string
  testData: Record<string, any>
}

export default function AdminEmailsPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testLoading, setTestLoading] = useState<string | null>(null)

  useEffect(() => {
    loadTemplates()
  }, [])



  const loadTemplates = async () => {
    try {
      const res = await fetch('/api/admin/emails/templates')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) setTemplates(data)
      }
    } catch {}
  }

  const handleSaveTemplate = async (template: EmailTemplate) => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/emails/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      })
      if (res.ok) {
        const saved = await res.json()
        setTemplates(prev => prev.map(t => t.slug === saved.slug ? saved : t))
        toast.success(`Template "${template.name}" salvo!`)
      } else {
        toast.error('Erro ao salvar template')
      }
    } catch {
      toast.error('Erro ao salvar template')
    }
    setSaving(false)
  }



  const handleSendTest = async (template: EmailTemplate) => {
    if (!template.testEmail) {
      toast.error('Digite um e-mail para teste')
      return
    }
    if (!template.templateId) {
      toast.error('Informe o templateId do SendGrid')
      return
    }
    let dynamicData = {}
    try {
      if (typeof template.testData === 'string') {
        dynamicData = JSON.parse(template.testData)
      } else {
        dynamicData = template.testData
      }
    } catch {
      toast.error('JSON de variáveis de teste inválido')
      return
    }
    setTestLoading(template.id)
    try {
      const response = await fetch('/api/admin/emails/send-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: template.testEmail,
          templateId: template.templateId,
          dynamicTemplateData: dynamicData
        })
      })
      const data = await response.json()
      if (response.ok) {
        toast.success(`E-mail de teste enviado para ${template.testEmail}!`)
      } else {
        toast.error(data.error || 'Erro ao enviar e-mail de teste')
      }
    } catch (error) {
      toast.error('Erro ao enviar e-mail de teste')
    } finally {
      setTestLoading(null)
    }
  }

  // Renderização dos campos para cada template
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none">Templates de E-mail (SendGrid)</h1>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none">
        <h2 className="text-lg font-semibold mb-2 text-blue-800">ℹ️ Configuração de E-mail</h2>
        <p className="text-blue-700 text-sm">
          A configuração de e-mail (remetente e chave da API) agora é gerenciada em 
          <a href="/admin/env-config" className="text-blue-600 underline font-medium"> Configurações de Ambiente</a>.
        </p>
      </div>
      {templates.map((template) => (
        <div key={template.id} className="bg-white rounded-lg shadow p-6 mb-6 focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none">
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <input value={template.name} disabled className="w-full bg-gray-100 rounded px-3 py-2 focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none" />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">Slug</label>
            <input value={template.slug} disabled className="w-full bg-gray-100 rounded px-3 py-2 focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none" />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">ID do Template SendGrid</label>
            <input value={template.templateId} onChange={e => setTemplates(prev => prev.map(t => t.id === template.id ? { ...t, templateId: e.target.value } : t))} className="w-full border rounded px-3 py-2 focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none text-gray-900 placeholder:text-gray-700" placeholder="d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">E-mail para teste</label>
            <input value={template.testEmail} onChange={e => setTemplates(prev => prev.map(t => t.id === template.id ? { ...t, testEmail: e.target.value } : t))} className="w-full border rounded px-3 py-2 focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none text-gray-900 placeholder:text-gray-700" placeholder="seu@email.com" />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">Variáveis de teste (JSON)</label>
            <textarea value={JSON.stringify(template.testData, null, 2)} onChange={e => setTemplates(prev => prev.map(t => t.id === template.id ? { ...t, testData: JSON.parse(e.target.value) } : t))} className="w-full border rounded px-3 py-2 font-mono focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none text-gray-900 placeholder:text-gray-700" rows={3} />
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={() => handleSaveTemplate(template)} disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none">Salvar</button>
            <button onClick={() => handleSendTest(template)} disabled={testLoading === template.id} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none">Enviar Teste</button>
          </div>
        </div>
      ))}
    </div>
  )
} 