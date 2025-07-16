'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

interface BlogImageUploadProps {
  onImageUpload: (imageUrl: string) => void
  currentImage?: string
  className?: string
}

export default function BlogImageUpload({ onImageUpload, currentImage, className = '' }: BlogImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    if (!file) return

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Tipo de arquivo não suportado. Envie uma imagem.')
      return
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      // Se quiser adicionar alt ou postId, adicione aqui
      // formData.append('alt', 'Imagem de destaque do post')

      const response = await fetch('/api/blog/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.success && data.image?.url) {
        onImageUpload(data.image.url)
        toast.success('Imagem enviada com sucesso!')
      } else {
        toast.error(data.error || 'Erro ao enviar imagem')
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error('Erro ao enviar imagem')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const removeImage = () => {
    onImageUpload('')
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Imagem atual */}
      {currentImage && (
        <div className="relative">
          <img
            src={currentImage}
            alt="Imagem do post"
            className="w-full h-48 object-cover rounded-lg border border-gray-200"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Área de upload */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-pink-500 bg-pink-50'
            : 'border-gray-300 hover:border-pink-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="space-y-3">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            {isUploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600"></div>
            ) : (
              <ImageIcon className="w-6 h-6 text-gray-400" />
            )}
          </div>

          <div>
            <p className="text-sm text-gray-600">
              {isUploading ? 'Enviando imagem...' : 'Arraste uma imagem aqui ou'}
            </p>
            {!isUploading && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-pink-600 hover:text-pink-700 font-medium text-sm"
              >
                clique para selecionar
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500">
            Imagens até 5MB (JPG, PNG, GIF, WebP)
          </p>
        </div>
      </div>
    </div>
  )
} 