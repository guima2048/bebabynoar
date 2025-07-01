'use client'

import React, { useState, useEffect } from 'react'
import { 
  Upload, 
  Save, 
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface BannerSettings {
  bannerImageURL: string
  bannerTitle: string
  bannerSubtitle: string
  bannerDescription: string
  primaryButtonText: string
  primaryButtonLink: string
  secondaryButtonText: string
  secondaryButtonLink: string
  isActive: boolean
}

export default function LandingSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<BannerSettings>({
    bannerImageURL: '',
    bannerTitle: 'A Maior Rede Sugar do Brasil',
    bannerSubtitle: 'Mulheres Lindas, Homens Ricos',
    bannerDescription: 'Encontre sua conexão perfeita no Bebaby App. A plataforma mais confiável e segura para Sugar Babies e Sugar Daddies encontrarem relacionamentos genuínos.',
    primaryButtonText: 'Cadastre-se Grátis',
    primaryButtonLink: '/register',
    secondaryButtonText: 'Explorar Perfis',
    secondaryButtonLink: '/explore',
    isActive: true
  })

  // Carregar configurações do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('landing-settings')
    if (saved) {
      const settings = JSON.parse(saved)
      setFormData(settings)
      if (settings.bannerImageURL) {
        setPreviewImage(settings.bannerImageURL)
      }
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('A imagem deve ter menos de 10MB')
        return
      }

      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem')
        return
      }

      setSelectedFile(file)
      
      // Criar preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreviewImage(result)
        setFormData(prev => ({ ...prev, bannerImageURL: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (saving) {
      return
    }
    
    try {
      setSaving(true)
      console.log('Salvando configurações...')
      
      // Salvar no localStorage (temporário)
      localStorage.setItem('landing-settings', JSON.stringify(formData))
      
      console.log('Configurações salvas com sucesso!')
      alert('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert(`Erro ao salvar configurações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setPreviewImage(null)
    setFormData(prev => ({ ...prev, bannerImageURL: '' }))
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin/dashboard"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar ao Dashboard
        </Link>
        <div className="h-6 w-px bg-gray-300"></div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações da Landing Page</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Configurações do Banner</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título Principal
                </label>
                <input
                  type="text"
                  value={formData.bannerTitle}
                  onChange={(e) => setFormData({ ...formData, bannerTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Título do banner"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtítulo
                </label>
                <input
                  type="text"
                  value={formData.bannerSubtitle}
                  onChange={(e) => setFormData({ ...formData, bannerSubtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Subtítulo do banner"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.bannerDescription}
                  onChange={(e) => setFormData({ ...formData, bannerDescription: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Descrição do banner"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Botão Primário - Texto
                  </label>
                  <input
                    type="text"
                    value={formData.primaryButtonText}
                    onChange={(e) => setFormData({ ...formData, primaryButtonText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Texto do botão"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Botão Primário - Link
                  </label>
                  <input
                    type="text"
                    value={formData.primaryButtonLink}
                    onChange={(e) => setFormData({ ...formData, primaryButtonLink: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="/register"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Botão Secundário - Texto
                  </label>
                  <input
                    type="text"
                    value={formData.secondaryButtonText}
                    onChange={(e) => setFormData({ ...formData, secondaryButtonText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Texto do botão"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Botão Secundário - Link
                  </label>
                  <input
                    type="text"
                    value={formData.secondaryButtonLink}
                    onChange={(e) => setFormData({ ...formData, secondaryButtonLink: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="/explore"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Banner ativo
                </label>
              </div>
            </div>
          </div>

          {/* Upload de Imagem */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Imagem do Banner</h2>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="banner-image"
                />
                <label htmlFor="banner-image" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Clique para selecionar uma imagem ou arraste aqui
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, JPEG até 10MB
                  </p>
                </label>
              </div>

              {previewImage && (
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Preview:</span>
                    <button
                      onClick={handleRemoveImage}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remover
                    </button>
                  </div>
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                    <Image
                      src={previewImage}
                      alt="Preview do banner"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-pink-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar Configurações
              </>
            )}
          </button>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Preview do Banner</h2>
            
            <div className="relative bg-gradient-to-br from-pink-50 via-white to-purple-50 rounded-lg overflow-hidden">
              {previewImage && (
                <div className="absolute inset-0">
                  <Image
                    src={previewImage}
                    alt="Banner preview"
                    fill
                    className="object-cover opacity-20"
                  />
                </div>
              )}
              
              <div className="relative z-10 p-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {formData.bannerTitle}
                </h1>
                <h2 className="text-xl text-gray-700 mb-4">
                  {formData.bannerSubtitle}
                </h2>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  {formData.bannerDescription}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors">
                    {formData.primaryButtonText}
                  </button>
                  <button className="border-2 border-pink-600 text-pink-600 px-8 py-3 rounded-lg font-semibold hover:bg-pink-600 hover:text-white transition-colors">
                    {formData.secondaryButtonText}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Informações */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Informações</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• A imagem será exibida no banner principal da landing page</li>
              <li>• Tamanho recomendado: 1200x600 pixels</li>
              <li>• Formatos aceitos: PNG, JPG, JPEG</li>
              <li>• Tamanho máximo: 10MB</li>
              <li>• As alterações são aplicadas imediatamente</li>
              <li>• <strong>MODO TESTE:</strong> Salvando no navegador (localStorage)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 