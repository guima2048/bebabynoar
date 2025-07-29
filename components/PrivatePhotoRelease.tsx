'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { Lock, Unlock, Image as ImageIcon, X } from 'lucide-react'
import Image from 'next/image'

interface Photo {
  id: string
  url: string
  isPrivate: boolean
  uploadedAt: string
}

interface PrivatePhotoReleaseProps {
  targetUserId: string
  targetUserName: string
  onClose: () => void
}

export default function PrivatePhotoRelease({ targetUserId, targetUserName, onClose }: PrivatePhotoReleaseProps) {
  const { data: session } = useSession()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [releasing, setReleasing] = useState(false)

  useEffect(() => {
    if (session?.user) {
      loadPrivatePhotos()
    }
  }, [session])

  const loadPrivatePhotos = async () => {
    try {
      const response = await fetch('/api/user/photos?private=true', {
        headers: {
          'x-user-id': session?.user?.id || ''
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPhotos(data.photos || [])
      } else {
        toast.error('Erro ao carregar fotos privadas')
      }
    } catch (error) {
      toast.error('Erro ao carregar fotos privadas')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoSelect = (photoId: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    )
  }

  const handleReleasePhotos = async () => {
    if (selectedPhotos.length === 0) {
      toast.error('Selecione pelo menos uma foto')
      return
    }

    try {
      setReleasing(true)
      
      const response = await fetch('/api/photos/release-private', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': session?.user?.id || ''
        },
        body: JSON.stringify({
          targetUserId,
          photoIds: selectedPhotos
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`Fotos liberadas com sucesso para ${targetUserName}!`)
        setSelectedPhotos([])
        onClose()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao liberar fotos')
      }
    } catch (error) {
      toast.error('Erro ao liberar fotos')
    } finally {
      setReleasing(false)
    }
  }

  const selectAll = () => {
    setSelectedPhotos(photos.map(photo => photo.id))
  }

  const deselectAll = () => {
    setSelectedPhotos([])
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#27272a] rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando fotos privadas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#27272a] rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Liberar Fotos Privadas</h2>
            <p className="text-gray-400 text-sm">
              Para {targetUserName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Fotos */}
        {photos.length === 0 ? (
          <div className="text-center py-8">
            <Lock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              Nenhuma foto privada encontrada
            </h3>
            <p className="text-gray-500">
              Você precisa ter fotos privadas para poder liberá-las
            </p>
          </div>
        ) : (
          <>
            {/* Controles */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {selectedPhotos.length} de {photos.length} selecionadas
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                >
                  Selecionar todas
                </button>
                <button
                  onClick={deselectAll}
                  className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                >
                  Limpar
                </button>
              </div>
            </div>

            {/* Grid de fotos */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedPhotos.includes(photo.id)
                      ? 'border-pink-500 bg-pink-500/20'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => handlePhotoSelect(photo.id)}
                >
                  <Image
                    src={photo.url}
                    alt="Foto privada"
                    width={200}
                    height={200}
                    className="w-full h-32 object-cover"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    {selectedPhotos.includes(photo.id) ? (
                      <Unlock className="w-6 h-6 text-pink-500" />
                    ) : (
                      <Lock className="w-6 h-6 text-white opacity-0 group-hover:opacity-100" />
                    )}
                  </div>
                  
                  {/* Checkbox */}
                  <div className="absolute top-2 right-2">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPhotos.includes(photo.id)
                        ? 'bg-pink-500 border-pink-500'
                        : 'bg-gray-800 border-gray-600'
                    }`}>
                      {selectedPhotos.includes(photo.id) && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Botões de ação */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReleasePhotos}
                disabled={selectedPhotos.length === 0 || releasing}
                className="flex-1 px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {releasing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Liberando...
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    Liberar {selectedPhotos.length} foto{selectedPhotos.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 