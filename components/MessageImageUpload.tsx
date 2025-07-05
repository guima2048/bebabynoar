'use client'

import React, { useState, useRef } from 'react'
import { Image, X, Upload, Loader2 } from 'lucide-react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import toast from 'react-hot-toast'

interface MessageImageUploadProps {
  onImageUpload: (imageURL: string) => void
  disabled?: boolean
}

export default function MessageImageUpload({ onImageUpload, disabled = false }: MessageImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas imagens')
      return
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB')
      return
    }

    // Criar preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload para Firebase Storage
    setUploading(true)
    try {
      if (!storage) {
        toast.error('Erro de conexão com o storage')
        return
      }

      // Criar nome único para o arquivo
      const timestamp = Date.now()
      const fileName = `message-images/${timestamp}_${file.name}`
      const storageRef = ref(storage, fileName)

      // Upload do arquivo
      const snapshot = await uploadBytes(storageRef, file)
      
      // Obter URL de download
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      // Chamar callback com a URL
      onImageUpload(downloadURL)
      
      // Limpar preview
      setPreview(null)
      
      toast.success('Imagem enviada com sucesso!')
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error('Erro ao enviar imagem')
    } finally {
      setUploading(false)
    }
  }

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click()
    }
  }

  const removePreview = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
        disabled={disabled || uploading}
      />
      
      <button
        onClick={handleClick}
        disabled={disabled || uploading}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Enviar imagem"
      >
        {uploading ? (
          <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
        ) : (
          <Image className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Preview da imagem */}
      {preview && (
        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg"
            />
            <button
              onClick={removePreview}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  )
} 