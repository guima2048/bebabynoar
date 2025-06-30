'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, Move, Settings } from 'lucide-react'

interface BlogSection {
  id: string
  type: 'hero' | 'about' | 'features' | 'testimonials' | 'cta' | 'newsletter' | 'contact'
  title: string
  subtitle?: string
  content: string
  imageUrl?: string
  backgroundColor?: string
  textColor?: string
  order: number
  isActive: boolean
  config: {
    layout?: 'left' | 'right' | 'center'
    showTitle?: boolean
    showSubtitle?: boolean
    showImage?: boolean
    buttonText?: string
    buttonLink?: string
  }
}

interface BlogSettings {
  sections: BlogSection[]
}

const sectionTypes = [
  { value: 'hero', label: 'Hero Section', description: 'Seção principal com título e chamada para ação' },
  { value: 'about', label: 'Sobre', description: 'Seção de informações sobre a empresa' },
  { value: 'features', label: 'Recursos', description: 'Destaque dos principais recursos' },
  { value: 'testimonials', label: 'Depoimentos', description: 'Testimonials de usuários' },
  { value: 'cta', label: 'Chamada para Ação', description: 'Seção para conversão' },
  { value: 'newsletter', label: 'Newsletter', description: 'Inscrição em newsletter' },
  { value: 'contact', label: 'Contato', description: 'Informações de contato' }
]

export default function BlogSectionsPage() {
  const [settings, setSettings] = useState<BlogSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingSection, setEditingSection] = useState<BlogSection | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSection, setNewSection] = useState<Partial<BlogSection>>({
    type: 'hero',
    title: '',
    subtitle: '',
    content: '',
    backgroundColor: '#ffffff',
    textColor: '#2D3748',
    isActive: true,
    config: {
      layout: 'center',
      showTitle: true,
      showSubtitle: true,
      showImage: false,
      buttonText: '',
      buttonLink: ''
    }
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/blog-settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (updatedSettings: BlogSettings) => {
    try {
      const response = await fetch('/api/blog-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      })
      
      if (response.ok) {
        setSettings(updatedSettings)
        return true
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
    }
    return false
  }

  const toggleSectionActive = async (sectionId: string) => {
    if (!settings) {
      return
    }

    const updatedSections = settings.sections.map(section =>
      section.id === sectionId ? { ...section, isActive: !section.isActive } : section
    )

    const updatedSettings = { ...settings, sections: updatedSections }
    await saveSettings(updatedSettings)
  }

  const deleteSection = async (sectionId: string) => {
    if (!settings || !confirm('Tem certeza que deseja excluir esta seção?')) {
      return
    }

    const updatedSections = settings.sections.filter(section => section.id !== sectionId)
    const updatedSettings = { ...settings, sections: updatedSections }
    await saveSettings(updatedSettings)
  }

  const addSection = async () => {
    if (!settings || !newSection.title) {
      return
    }

    const section: BlogSection = {
      id: `section-${Date.now()}`,
      type: newSection.type as any,
      title: newSection.title,
      subtitle: newSection.subtitle || '',
      content: newSection.content || '',
      imageUrl: newSection.imageUrl || '',
      backgroundColor: newSection.backgroundColor || '#ffffff',
      textColor: newSection.textColor || '#2D3748',
      order: settings.sections.length + 1,
      isActive: newSection.isActive || true,
      config: newSection.config || {
        layout: 'center',
        showTitle: true,
        showSubtitle: true,
        showImage: false,
        buttonText: '',
        buttonLink: ''
      }
    }

    const updatedSections = [...settings.sections, section]
    const updatedSettings = { ...settings, sections: updatedSections }
    
    if (await saveSettings(updatedSettings)) {
      setShowAddModal(false)
      setNewSection({
        type: 'hero',
        title: '',
        subtitle: '',
        content: '',
        backgroundColor: '#ffffff',
        textColor: '#2D3748',
        isActive: true,
        config: {
          layout: 'center',
          showTitle: true,
          showSubtitle: true,
          showImage: false,
          buttonText: '',
          buttonLink: ''
        }
      })
    }
  }

  const updateSection = async (updatedSection: BlogSection) => {
    if (!settings) {
      return
    }

    const updatedSections = settings.sections.map(section =>
      section.id === updatedSection.id ? updatedSection : section
    )

    const updatedSettings = { ...settings, sections: updatedSections }
    if (await saveSettings(updatedSettings)) {
      setEditingSection(null)
    }
  }

  const moveSection = async (sectionId: string, direction: 'up' | 'down') => {
    if (!settings) {
      return
    }

    const sections = [...settings.sections]
    const currentIndex = sections.findIndex(s => s.id === sectionId)
    
    if (direction === 'up' && currentIndex > 0) {
      [sections[currentIndex], sections[currentIndex - 1]] = [sections[currentIndex - 1], sections[currentIndex]]
    } else if (direction === 'down' && currentIndex < sections.length - 1) {
      [sections[currentIndex], sections[currentIndex + 1]] = [sections[currentIndex + 1], sections[currentIndex]]
    }

    const updatedSections = sections.map((section, index) => ({
      ...section,
      order: index + 1
    }))

    const updatedSettings = { ...settings, sections: updatedSections }
    await saveSettings(updatedSettings)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando seções...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Seções do Blog</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Plus size={20} />
              Adicionar Seção
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600">
              Use os controles para ativar/desativar, editar ou reordenar as seções. Clique nos botões de seta para mover as seções.
            </p>
          </div>

          {settings && (
            <div className="space-y-4">
              {(settings?.sections ?? []).map((section, index) => (
                <div key={section.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveSection(section.id, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveSection(section.id, 'down')}
                          disabled={index === settings.sections.length - 1}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                        >
                          ↓
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          section.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {section.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                        
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {sectionTypes.find(t => t.value === section.type)?.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSectionActive(section.id)}
                        className="p-2 hover:bg-gray-200 rounded"
                      >
                        {section.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      
                      <button
                        onClick={() => setEditingSection(section)}
                        className="p-2 hover:bg-gray-200 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      
                      <button
                        onClick={() => deleteSection(section.id)}
                        className="p-2 hover:bg-red-100 rounded text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                    {section.subtitle && (
                      <p className="text-sm text-gray-600 mt-1">{section.subtitle}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {settings?.sections.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhuma seção configurada ainda.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Adicionar Primeira Seção
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Adicionar Seção */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Adicionar Nova Seção</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Seção
                </label>
                <select
                  value={newSection.type}
                  onChange={(e) => setNewSection({...newSection, type: e.target.value as any})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  {sectionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={newSection.title}
                  onChange={(e) => setNewSection({...newSection, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Digite o título da seção"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtítulo (opcional)
                </label>
                <input
                  type="text"
                  value={newSection.subtitle}
                  onChange={(e) => setNewSection({...newSection, subtitle: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Digite o subtítulo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo
                </label>
                <textarea
                  value={newSection.content}
                  onChange={(e) => setNewSection({...newSection, content: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg h-32"
                  placeholder="Digite o conteúdo da seção"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor de Fundo
                  </label>
                  <input
                    type="color"
                    value={newSection.backgroundColor}
                    onChange={(e) => setNewSection({...newSection, backgroundColor: e.target.value})}
                    className="w-full h-12 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor do Texto
                  </label>
                  <input
                    type="color"
                    value={newSection.textColor}
                    onChange={(e) => setNewSection({...newSection, textColor: e.target.value})}
                    className="w-full h-12 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={addSection}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Adicionar Seção
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editar Seção */}
      {editingSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Editar Seção</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={editingSection.title}
                  onChange={(e) => setEditingSection({...editingSection, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtítulo
                </label>
                <input
                  type="text"
                  value={editingSection.subtitle || ''}
                  onChange={(e) => setEditingSection({...editingSection, subtitle: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo
                </label>
                <textarea
                  value={editingSection.content}
                  onChange={(e) => setEditingSection({...editingSection, content: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg h-32"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor de Fundo
                  </label>
                  <input
                    type="color"
                    value={editingSection.backgroundColor || '#ffffff'}
                    onChange={(e) => setEditingSection({...editingSection, backgroundColor: e.target.value})}
                    className="w-full h-12 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor do Texto
                  </label>
                  <input
                    type="color"
                    value={editingSection.textColor || '#2D3748'}
                    onChange={(e) => setEditingSection({...editingSection, textColor: e.target.value})}
                    className="w-full h-12 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Layout
                </label>
                <select
                  value={editingSection.config?.layout || 'center'}
                  onChange={(e) => setEditingSection({
                    ...editingSection, 
                    config: {...editingSection.config, layout: e.target.value as any}
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="left">Esquerda</option>
                  <option value="center">Centralizado</option>
                  <option value="right">Direita</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingSection.config?.showTitle}
                      onChange={(e) => setEditingSection({
                        ...editingSection,
                        config: {...editingSection.config, showTitle: e.target.checked}
                      })}
                    />
                    <span className="text-sm font-medium text-gray-700">Mostrar Título</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingSection.config?.showSubtitle}
                      onChange={(e) => setEditingSection({
                        ...editingSection,
                        config: {...editingSection.config, showSubtitle: e.target.checked}
                      })}
                    />
                    <span className="text-sm font-medium text-gray-700">Mostrar Subtítulo</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto do Botão
                </label>
                <input
                  type="text"
                  value={editingSection.config?.buttonText || ''}
                  onChange={(e) => setEditingSection({
                    ...editingSection,
                    config: {...editingSection.config, buttonText: e.target.value}
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Ex: Saiba Mais"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link do Botão
                </label>
                <input
                  type="text"
                  value={editingSection.config?.buttonLink || ''}
                  onChange={(e) => setEditingSection({
                    ...editingSection,
                    config: {...editingSection.config, buttonLink: e.target.value}
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Ex: /about"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => updateSection(editingSection)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 