'use client'

import React, { useState, useEffect } from 'react'
import { 
  Upload, 
  Eye, 
  Save, 
  X, 
  Image as ImageIcon,
  ArrowLeft
} from 'lucide-react'
import { getFirestoreDB, getFirebaseStorage } from '@/lib/firebase'
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc,
  query,
  where
} from 'firebase/firestore'
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject
} from 'firebase/storage'
import Link from 'next/link'
import Image from 'next/image'

interface BannerSettings {
  id: string
  bannerImageURL: string
  bannerTitle: string
  bannerSubtitle: string
  bannerDescription: string
  primaryButtonText: string
  primaryButtonLink: string
  secondaryButtonText: string
  secondaryButtonLink: string
  isActive: boolean
  updatedAt: string
}

export default function LandingSettingsPage() {
  const [settings, setSettings] = useState<BannerSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    bannerTitle: 'A Maior Rede Sugar do Brasil',
    bannerSubtitle: 'Mulheres Lindas, Homens Ricos',
    bannerDescription: 'Encontre sua conexão perfeita no Bebaby App. A plataforma mais confiável e segura para Sugar Babies e Sugar Daddies encontrarem relacionamentos genuínos.',
    primaryButtonText: 'Cadastre-se Grátis',
    primaryButtonLink: '/register',
    secondaryButtonText: 'Explorar Perfis',
    secondaryButtonLink: '/explore',
    isActive: true
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const db = getFirestoreDB()
      if (!db) {
        throw new Error('Erro de configuração do banco de dados')
      }

      const settingsQuery = query(
        collection(db, 'landing_settings'),
        where('isActive', '==', true)
      )
      const snapshot = await getDocs(settingsQuery)

      if (!snapshot.empty) {
        const doc = snapshot.docs[0]
        const data = doc.data() as BannerSettings
        setSettings({ ...data, id: doc.id })
        setFormData({
          bannerTitle: data.bannerTitle || 'A Maior Rede Sugar do Brasil',
          bannerSubtitle: data.bannerSubtitle || 'Mulheres Lindas, Homens Ricos',
          bannerDescription: data.bannerDescription || 'Encontre sua conexão perfeita no Bebaby App. A plataforma mais confiável e segura para Sugar Babies e Sugar Daddies encontrarem relacionamentos genuínos.',
          primaryButtonText: data.primaryButtonText || 'Cadastre-se Grátis',
          primaryButtonLink: data.primaryButtonLink || '/register',
          secondaryButtonText: data.secondaryButtonText || 'Explorar Perfis',
          secondaryButtonLink: data.secondaryButtonLink || '/explore',
          isActive: data.isActive !== false
        })
        setPreviewImage(data.bannerImageURL || null)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('A imagem deve ter menos de 5MB')
        return
      }

      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem')
        return
      }

      setSelectedFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const storage = getFirebaseStorage()
    if (!storage) {
      throw new Error('Erro de configuração do storage')
    }

    const fileName = `landing-banner-${Date.now()}-${file.name}`
    const storageRef = ref(storage, `landing/${fileName}`)
    
    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)
    
    return downloadURL
  }

  const deleteOldImage = async (imageURL: string) => {
    try {
      const storage = getFirebaseStorage()
      if (!storage) return

      const imageRef = ref(storage, imageURL)
      await deleteObject(imageRef)
    } catch (error) {
      console.error('Erro ao deletar imagem antiga:', error)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const db = getFirestoreDB()
      if (!db) {
        throw new Error('Erro de configuração do banco de dados')
      }

      let bannerImageURL = settings?.bannerImageURL || ''

      // Upload new image if selected
      if (selectedFile) {
        setUploading(true)
        bannerImageURL = await uploadImage(selectedFile)
        
        // Delete old image if exists
        if (settings?.bannerImageURL && settings.bannerImageURL !== bannerImageURL) {
          await deleteOldImage(settings.bannerImageURL)
        }
        setUploading(false)
      }

      const settingsData = {
        ...formData,
        bannerImageURL,
        updatedAt: new Date().toISOString()
      }

      if (settings?.id) {
        // Update existing settings
        await updateDoc(doc(db, 'landing_settings', settings.id), settingsData)
      } else {
        // Create new settings
        const docRef = doc(collection(db, 'landing_settings'))
        await setDoc(docRef, settingsData)
      }

      await loadSettings()
      alert('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setPreviewImage(null)
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
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
                    PNG, JPG até 5MB
                  </p>
                </label>
              </div>

              {previewImage && (
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Preview:</span>
                    <button
                      onClick={handleRemoveImage}
                      className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
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
            disabled={saving || uploading}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-pink-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Preview do Banner
            </h2>
            
            <div className="bg-gradient-to-br from-pink-50 via-white to-purple-50 rounded-xl p-8">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {formData.bannerTitle}
                  </h1>
                  <h2 className="text-xl font-semibold text-pink-600 mb-4">
                    {formData.bannerSubtitle}
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {formData.bannerDescription}
                  </p>
                </div>

                {previewImage && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <Image
                      src={previewImage}
                      alt="Banner preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-full font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300">
                    {formData.primaryButtonText}
                  </button>
                  <button className="border-2 border-pink-500 text-pink-500 px-6 py-3 rounded-full font-semibold hover:bg-pink-50 transition-all duration-300">
                    {formData.secondaryButtonText}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Informações */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Informações</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• A imagem será exibida no banner principal da landing page</li>
              <li>• Tamanho recomendado: 1200x600 pixels</li>
              <li>• Formatos aceitos: PNG, JPG, JPEG</li>
              <li>• Tamanho máximo: 5MB</li>
              <li>• As alterações são aplicadas imediatamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 