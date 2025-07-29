'use client'

import React, { useState, useEffect } from 'react'
import { 
  Save, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  CheckCircle, 
  Database,
  Mail,
  CreditCard,
  Globe,
  Shield,
  Settings
} from 'lucide-react'
import toast from 'react-hot-toast'

interface EnvVariable {
  key: string
  value: string
  description: string
  category: string
  required: boolean
  sensitive: boolean
}

interface EnvConfig {
  variables: EnvVariable[]
  lastUpdated: string
}

export default function EnvConfigPage() {
  const [envConfig, setEnvConfig] = useState<EnvConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSensitive, setShowSensitive] = useState(false)
  const [activeTab, setActiveTab] = useState('database')

  // Categorias de variáveis
  const categories = {
    database: { name: 'Banco de Dados', icon: Database },
    auth: { name: 'Autenticação', icon: Shield },
    app: { name: 'Aplicação', icon: Globe },
    email: { name: 'E-mail', icon: Mail },
    payment: { name: 'Pagamentos', icon: CreditCard },
    environment: { name: 'Ambiente', icon: Settings }
  }

  useEffect(() => {
    loadEnvConfig()
  }, [])

  const loadEnvConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/env-config')
      if (response.ok) {
        const data = await response.json()
        setEnvConfig(data)
      } else {
        toast.error('Erro ao carregar configurações')
      }
    } catch (error) {
      toast.error('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const saveEnvConfig = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/env-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(envConfig)
      })

      if (response.ok) {
        toast.success('Configurações salvas com sucesso!')
        await loadEnvConfig()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erro ao salvar')
      }
    } catch (error) {
      toast.error('Erro de conexão')
    } finally {
      setSaving(false)
    }
  }

  const updateVariable = (key: string, field: 'value' | 'description', newValue: string) => {
    if (!envConfig) return

    setEnvConfig({
      ...envConfig,
      variables: envConfig.variables.map(v => 
        v.key === key ? { ...v, [field]: newValue } : v
      )
    })
  }

  const addVariable = (category: string) => {
    if (!envConfig) return

    const newVar: EnvVariable = {
      key: '',
      value: '',
      description: '',
      category,
      required: false,
      sensitive: false
    }

    setEnvConfig({
      ...envConfig,
      variables: [...envConfig.variables, newVar]
    })
  }

  const removeVariable = (key: string) => {
    if (!envConfig) return

    setEnvConfig({
      ...envConfig,
      variables: envConfig.variables.filter(v => v.key !== key)
    })
  }

  const getVariablesByCategory = (category: string) => {
    return envConfig?.variables.filter(v => v.category === category) || []
  }

  const renderVariableInput = (variable: EnvVariable) => {
    const isSensitive = variable.sensitive && !showSensitive

    return (
      <div key={variable.key} className="space-y-2 p-4 border rounded-lg bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">{variable.key}</span>
            {variable.required && (
              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Obrigatório</span>
            )}
            {variable.sensitive && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">Sensível</span>
            )}
          </div>
          <button
            onClick={() => removeVariable(variable.key)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Remover
          </button>
        </div>
        
        <div className="space-y-2">
          <input
            placeholder="Valor"
            type={isSensitive ? "password" : "text"}
            value={variable.value}
            onChange={(e) => updateVariable(variable.key, 'value', e.target.value)}
            className="w-full p-2 border rounded font-mono text-sm"
          />
          
          <textarea
            placeholder="Descrição (opcional)"
            value={variable.description}
            onChange={(e) => updateVariable(variable.key, 'description', e.target.value)}
            rows={2}
            className="w-full p-2 border rounded text-sm"
          />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configurações de Ambiente</h1>
          <p className="text-gray-600">Gerencie todas as variáveis de ambiente do projeto</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSensitive(!showSensitive)}
            className="px-4 py-2 border rounded hover:bg-gray-50 focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none"
          >
            {showSensitive ? <EyeOff className="w-4 h-4 inline mr-2" /> : <Eye className="w-4 h-4 inline mr-2" />}
            {showSensitive ? 'Ocultar' : 'Mostrar'} Sensíveis
          </button>
          
          <button 
            onClick={saveEnvConfig} 
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin inline mr-2" /> : <Save className="w-4 h-4 inline mr-2" />}
            Salvar
          </button>
        </div>
      </div>

      {envConfig?.lastUpdated && (
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <CheckCircle className="w-4 h-4 inline mr-2 text-green-600" />
          <span className="text-green-800">
            Última atualização: {new Date(envConfig.lastUpdated).toLocaleString()}
          </span>
        </div>
      )}

      <div className="border-b">
        <div className="flex space-x-1">
          {Object.entries(categories).map(([key, category]) => {
            const Icon = category.icon
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 flex items-center gap-2 border-b-2 focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none ${
                  activeTab === key 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </button>
            )
          })}
        </div>
      </div>

      {Object.entries(categories).map(([categoryKey, category]) => (
        <div key={categoryKey} className={activeTab === categoryKey ? 'block' : 'hidden'}>
          <div className="bg-white border rounded-lg p-6 focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <category.icon className="w-5 h-5" />
              {category.name}
            </h2>
            
            <div className="space-y-4">
              {getVariablesByCategory(categoryKey).map(renderVariableInput)}
              
              <button
                onClick={() => addVariable(categoryKey)}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800"
              >
                + Adicionar Variável
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 