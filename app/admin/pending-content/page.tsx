'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface PendingPhoto {
  id: string
  userId: string
  userName: string
  photoURL: string
  uploadedAt: string
  isPrivate: boolean
}

interface PendingText {
  id: string
  userId: string
  userName: string
  field: 'about' | 'lookingFor'
  content: string
  updatedAt: string
}

export default function AdminPendingContentPage() {
  const [activeTab, setActiveTab] = useState<'photos' | 'texts'>('photos')
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([])
  const [pendingTexts, setPendingTexts] = useState<PendingText[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingContent()
  }, [])

  const fetchPendingContent = async () => {
    try {
      // Simular dados de fotos pendentes
      const mockPhotos: PendingPhoto[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'Maria123',
          photoURL: 'https://via.placeholder.com/300x400',
          uploadedAt: '2024-01-15T10:30:00Z',
          isPrivate: false
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'João456',
          photoURL: 'https://via.placeholder.com/300x400',
          uploadedAt: '2024-01-14T15:45:00Z',
          isPrivate: true
        }
      ]

      // Simular dados de textos pendentes
      const mockTexts: PendingText[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'Maria123',
          field: 'about',
          content: 'Sou uma pessoa muito interessante e gosto de...',
          updatedAt: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'João456',
          field: 'lookingFor',
          content: 'Busco alguém especial para...',
          updatedAt: '2024-01-14T15:45:00Z'
        }
      ]

      setPendingPhotos(mockPhotos)
      setPendingTexts(mockTexts)
    } catch (error) {
      console.error('Erro ao buscar conteúdo pendente:', error)
      toast.error('Erro ao carregar conteúdo pendente')
    } finally {
      setLoading(false)
    }
  }

  const handleApprovePhoto = async (photoId: string) => {
    try {
      const response = await fetch('/api/admin/moderate-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: photoId,
          contentType: 'photo',
          action: 'approve',
          adminNotes: 'Foto aprovada'
        })
      })

      if (response.ok) {
        setPendingPhotos(prev => prev.filter(photo => photo.id !== photoId))
        toast.success('Foto aprovada com sucesso')
      } else {
        toast.error('Erro ao aprovar foto')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao aprovar foto')
    }
  }

  const handleRejectPhoto = async (photoId: string) => {
    if (!confirm('Tem certeza que deseja rejeitar esta foto?')) { return }

    try {
      const response = await fetch('/api/admin/moderate-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: photoId,
          contentType: 'photo',
          action: 'reject',
          adminNotes: 'Foto rejeitada por não seguir diretrizes'
        })
      })

      if (response.ok) {
        setPendingPhotos(prev => prev.filter(photo => photo.id !== photoId))
        toast.success('Foto rejeitada com sucesso')
      } else {
        toast.error('Erro ao rejeitar foto')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao rejeitar foto')
    }
  }

  const handleApproveText = async (textId: string) => {
    try {
      const response = await fetch('/api/admin/moderate-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: textId,
          contentType: 'text',
          action: 'approve',
          adminNotes: 'Texto aprovado'
        })
      })

      if (response.ok) {
        setPendingTexts(prev => prev.filter(text => text.id !== textId))
        toast.success('Texto aprovado com sucesso')
      } else {
        toast.error('Erro ao aprovar texto')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao aprovar texto')
    }
  }

  const handleRejectText = async (textId: string) => {
    if (!confirm('Tem certeza que deseja rejeitar este texto?')) { return }

    try {
      const response = await fetch('/api/admin/moderate-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: textId,
          contentType: 'text',
          action: 'reject',
          adminNotes: 'Texto rejeitado por não seguir diretrizes'
        })
      })

      if (response.ok) {
        setPendingTexts(prev => prev.filter(text => text.id !== textId))
        toast.success('Texto rejeitado com sucesso')
      } else {
        toast.error('Erro ao rejeitar texto')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao rejeitar texto')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Moderar Conteúdo</h1>
        <p className="text-gray-600 mt-2">Aprovar ou rejeitar conteúdo enviado pelos usuários</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border p-1 mb-6">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'photos'
                ? 'bg-pink-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📸 Fotos Pendentes ({pendingPhotos.length})
          </button>
          <button
            onClick={() => setActiveTab('texts')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'texts'
                ? 'bg-pink-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📝 Textos Pendentes ({pendingTexts.length})
          </button>
        </div>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'photos' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Fotos Pendentes</h2>
          
          {pendingPhotos.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm border">
              <p className="text-gray-500">Nenhuma foto pendente de aprovação.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingPhotos.map((photo) => (
                <div key={photo.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <img
                    src={photo.photoURL}
                    alt="Foto pendente"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium text-gray-900">{photo.userName}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(photo.uploadedAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        photo.isPrivate ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {photo.isPrivate ? 'Privada' : 'Pública'}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprovePhoto(photo.id)}
                        className="flex-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                      >
                        ✅ Aprovar
                      </button>
                      <button
                        onClick={() => handleRejectPhoto(photo.id)}
                        className="flex-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                      >
                        ❌ Rejeitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'texts' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Textos Pendentes</h2>
          
          {pendingTexts.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm border">
              <p className="text-gray-500">Nenhum texto pendente de aprovação.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTexts.map((text) => (
                <div key={text.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{text.userName}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(text.updatedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {text.field === 'about' ? 'Sobre Mim' : 'O Que Busco'}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Conteúdo:</p>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-900">{text.content}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveText(text.id)}
                      className="flex-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                    >
                      ✅ Aprovar
                    </button>
                    <button
                      onClick={() => handleRejectText(text.id)}
                      className="flex-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      ❌ Rejeitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        {activeTab === 'photos' && `Total: ${pendingPhotos.length} foto(s) pendente(s)`}
        {activeTab === 'texts' && `Total: ${pendingTexts.length} texto(s) pendente(s)`}
      </div>
    </div>
  )
} 