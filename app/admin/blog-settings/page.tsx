'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Palette, Type, Image, Settings, Save } from 'lucide-react'

interface BlogSettings {
  // Cores
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  titleColor: string
  
  // Fontes
  titleFont: string
  bodyFont: string
  
  // Hero Section
  heroTitle: string
  heroSubtitle: string
  heroBackgroundImage: string
  heroBackgroundAlt: string
  
  // SEO Global
  siteTitle: string
  siteDescription: string
  defaultKeywords: string
  
  // Textos Estáticos
  searchPlaceholder: string
  recentArticlesTitle: string
  popularArticlesTitle: string
  readMoreText: string
  noArticlesText: string
  
  // Footer
  footerText: string
  privacyPolicyText: string
  termsText: string
  contactText: string
  
  // Meta
  updatedAt: string

  // Adicionar novas propriedades
  h1FontSize: string
  h1Align: string
  h1LineHeight: string
  h2FontSize: string
  h2Align: string
  h2LineHeight: string
}

const fontOptions = [
  'Playfair Display',
  'Lora',
  'Cormorant Garamond',
  'Merriweather',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Inter',
  'Roboto'
]

export default function BlogSettingsPage() {
  const [settings, setSettings] = useState<BlogSettings>({
    primaryColor: '#D4AF37',
    secondaryColor: '#4A1E3A',
    backgroundColor: '#FAFAFA',
    textColor: '#2D3748',
    titleColor: '#D4AF37',
    titleFont: 'Playfair Display',
    bodyFont: 'Open Sans',
    heroTitle: 'Universo Sugar - O Melhor Site de Relacionamento Sugar',
    heroSubtitle: 'Descubra o mundo exclusivo dos relacionamentos sugar. Conecte-se com sugar daddies e sugar babies de qualidade.',
    heroBackgroundImage: '',
    heroBackgroundAlt: 'Universo Sugar - Site de relacionamento sugar',
    siteTitle: 'Universo Sugar - Site de Relacionamento Sugar | Sugar Daddy e Sugar Baby',
    siteDescription: 'O melhor site de relacionamento sugar do Brasil. Conecte-se com sugar daddies e sugar babies de qualidade. Patrocinador confiável para relacionamentos sugar.',
    defaultKeywords: 'Universo sugar, Patrocinador, Sugar baby, sugar daddy, site de relacionamento sugar',
    searchPlaceholder: 'Pesquise artigos sobre relacionamentos sugar...',
    recentArticlesTitle: 'Artigos Recentes',
    popularArticlesTitle: 'Artigos Populares',
    readMoreText: 'Ler Mais',
    noArticlesText: 'Nenhum artigo encontrado',
    footerText: '© 2024 Universo Sugar. Todos os direitos reservados.',
    privacyPolicyText: 'Política de Privacidade',
    termsText: 'Termos de Uso',
    contactText: 'Contato',
    updatedAt: new Date().toISOString(),
    h1FontSize: '3rem',
    h1Align: 'center',
    h1LineHeight: '1.2',
    h2FontSize: '2rem',
    h2Align: 'center',
    h2LineHeight: '1.2',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

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
      toast.error('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/blog-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        toast.success('Configurações salvas com sucesso!')
      } else {
        toast.error('Erro ao salvar configurações')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!file) { return; }

    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. Máximo 10MB.')
      return
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não suportado. Use JPG, PNG ou WebP.')
      return
    }

    setUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/blog/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(prev => ({
          ...prev,
          heroBackgroundImage: data.url
        }))
        toast.success('Imagem de fundo atualizada!')
      } else {
        toast.error('Erro ao fazer upload da imagem')
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error('Erro ao fazer upload da imagem')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleInputChange = (field: keyof BlogSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Settings className="h-6 w-6 text-gray-600" />
                <h1 className="text-2xl font-bold text-gray-900">Configurações do Blog</h1>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Salvando...' : 'Salvar Configurações'}</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Cores */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Palette className="h-5 w-5 text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Cores</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cor Primária (Dourado)
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <input
                        type="text"
                        value={settings.primaryColor}
                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="#D4AF37"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cor Secundária (Roxo)
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={settings.secondaryColor}
                        onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <input
                        type="text"
                        value={settings.secondaryColor}
                        onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="#4A1E3A"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cor de Fundo
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={settings.backgroundColor}
                        onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <input
                        type="text"
                        value={settings.backgroundColor}
                        onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="#FAFAFA"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cor do Texto
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={settings.textColor}
                        onChange={(e) => handleInputChange('textColor', e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <input
                        type="text"
                        value={settings.textColor}
                        onChange={(e) => handleInputChange('textColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="#2D3748"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cor dos Títulos
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={settings.titleColor}
                        onChange={(e) => handleInputChange('titleColor', e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <input
                        type="text"
                        value={settings.titleColor}
                        onChange={(e) => handleInputChange('titleColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="#D4AF37"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fontes */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Type className="h-5 w-5 text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Fontes</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fonte dos Títulos
                    </label>
                    <select
                      value={settings.titleFont}
                      onChange={(e) => handleInputChange('titleFont', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {fontOptions.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fonte do Corpo do Texto
                    </label>
                    <select
                      value={settings.bodyFont}
                      onChange={(e) => handleInputChange('bodyFont', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {fontOptions.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Section */}
            <div className="mt-8 space-y-6">
              <div className="flex items-center space-x-2">
                <Image className="h-5 w-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">Hero Section</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título Principal
                  </label>
                  <input
                    type="text"
                    value={settings.heroTitle}
                    onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Título da Hero Section"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtítulo
                  </label>
                  <input
                    type="text"
                    value={settings.heroSubtitle}
                    onChange={(e) => handleInputChange('heroSubtitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Subtítulo da Hero Section"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagem de Fundo
                  </label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) { handleImageUpload(file); }
                      }}
                      disabled={uploadingImage}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    {settings.heroBackgroundImage && (
                      <img
                        src={settings.heroBackgroundImage}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-md"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto Alternativo da Imagem (SEO)
                  </label>
                  <input
                    type="text"
                    value={settings.heroBackgroundAlt}
                    onChange={(e) => handleInputChange('heroBackgroundAlt', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Descrição da imagem para SEO"
                  />
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="mt-8 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Configurações SEO</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título do Site
                  </label>
                  <input
                    type="text"
                    value={settings.siteTitle}
                    onChange={(e) => handleInputChange('siteTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Título que aparece nas abas do navegador"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição do Site
                  </label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Descrição que aparece nos resultados de busca"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Palavras-chave Padrão
                  </label>
                  <input
                    type="text"
                    value={settings.defaultKeywords}
                    onChange={(e) => handleInputChange('defaultKeywords', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Universo sugar, Patrocinador, Sugar baby, sugar daddy, site de relacionamento sugar"
                  />
                </div>
              </div>
            </div>

            {/* Textos Estáticos */}
            <div className="mt-8 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Textos Estáticos</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Placeholder da Busca
                  </label>
                  <input
                    type="text"
                    value={settings.searchPlaceholder}
                    onChange={(e) => handleInputChange('searchPlaceholder', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Texto do campo de busca"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título &quot;Artigos Recentes&quot;
                  </label>
                  <input
                    type="text"
                    value={settings.recentArticlesTitle}
                    onChange={(e) => handleInputChange('recentArticlesTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Título da seção de artigos recentes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título &quot;Artigos Populares&quot;
                  </label>
                  <input
                    type="text"
                    value={settings.popularArticlesTitle}
                    onChange={(e) => handleInputChange('popularArticlesTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Título da seção de artigos populares"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto &quot;Ler Mais&quot;
                  </label>
                  <input
                    type="text"
                    value={settings.readMoreText}
                    onChange={(e) => handleInputChange('readMoreText', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Texto do botão ler mais"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto &quot;Nenhum Artigo&quot;
                  </label>
                  <input
                    type="text"
                    value={settings.noArticlesText}
                    onChange={(e) => handleInputChange('noArticlesText', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Mensagem quando não há artigos"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Rodapé</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto do Copyright
                  </label>
                  <input
                    type="text"
                    value={settings.footerText}
                    onChange={(e) => handleInputChange('footerText', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="© 2024 Universo Sugar. Todos os direitos reservados."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto &quot;Política de Privacidade&quot;
                  </label>
                  <input
                    type="text"
                    value={settings.privacyPolicyText}
                    onChange={(e) => handleInputChange('privacyPolicyText', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Política de Privacidade"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto &quot;Termos de Uso&quot;
                  </label>
                  <input
                    type="text"
                    value={settings.termsText}
                    onChange={(e) => handleInputChange('termsText', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Termos de Uso"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto &quot;Contato&quot;
                  </label>
                  <input
                    type="text"
                    value={settings.contactText}
                    onChange={(e) => handleInputChange('contactText', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Contato"
                  />
                </div>
              </div>
            </div>

            {/* Configurações de H1 e H2 */}
            <div className="mt-8 space-y-6">
              <div className="flex items-center space-x-2">
                <Type className="h-5 w-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">Configurações de H1 e H2</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">H1</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho da Fonte</label>
                    <input type="text" value={settings.h1FontSize} onChange={e => handleInputChange('h1FontSize', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Ex: 3rem ou 48px" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alinhamento</label>
                    <select value={settings.h1Align} onChange={e => handleInputChange('h1Align', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option value="left">Esquerda</option>
                      <option value="center">Centro</option>
                      <option value="right">Direita</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Altura da Linha</label>
                    <input type="text" value={settings.h1LineHeight} onChange={e => handleInputChange('h1LineHeight', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Ex: 1.2 ou 56px" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">H2</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho da Fonte</label>
                    <input type="text" value={settings.h2FontSize} onChange={e => handleInputChange('h2FontSize', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Ex: 2rem ou 32px" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alinhamento</label>
                    <select value={settings.h2Align} onChange={e => handleInputChange('h2Align', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option value="left">Esquerda</option>
                      <option value="center">Centro</option>
                      <option value="right">Direita</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Altura da Linha</label>
                    <input type="text" value={settings.h2LineHeight} onChange={e => handleInputChange('h2LineHeight', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Ex: 1.2 ou 40px" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 