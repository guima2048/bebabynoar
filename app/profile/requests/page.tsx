'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, Check, X, Clock, User, Calendar, MapPin, Heart, MessageCircle, Settings, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

interface ProfileRequest {
  id: string
  requesterId: string
  requesterName: string
  requesterUsername: string
  requesterPhotoURL?: string
  requesterAge: number
  requesterCity: string
  requesterState: string
  requesterUserType: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  message?: string
}

interface PrivacySettings {
  allowProfileRequests: boolean
  autoApproveRequests: boolean
  showOnlineStatus: boolean
  showLastSeen: boolean
  allowPrivatePhotos: boolean
}

export default function RequestsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<ProfileRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    allowProfileRequests: true,
    autoApproveRequests: false,
    showOnlineStatus: true,
    showLastSeen: true,
    allowPrivatePhotos: true
  })
  const [showSettings, setShowSettings] = useState(false)
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (user) {
      loadRequests()
      loadPrivacySettings()
    }
  }, [user, authLoading, router, activeTab])

  const loadRequests = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch(`/api/profile/requests?status=${activeTab}`)
      const data = await response.json()

      if (response.ok) {
        setRequests(data.requests || [])
        setStats({
          pending: data.stats?.pending || 0,
          approved: data.stats?.approved || 0,
          rejected: data.stats?.rejected || 0
        })
      } else {
        toast.error('Erro ao carregar solicitações')
      }
    } catch (error) {
      toast.error('Erro ao carregar solicitações')
    } finally {
      setLoading(false)
    }
  }

  const loadPrivacySettings = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/profile/privacy-settings')
      const data = await response.json()

      if (response.ok) {
        setPrivacySettings(data.settings)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de privacidade')
    }
  }

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    if (!user) return

    try {
      const response = await fetch('/api/profile/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action
        })
      })

      if (response.ok) {
        toast.success(action === 'approve' ? 'Solicitação aprovada!' : 'Solicitação rejeitada!')
        loadRequests()
      } else {
        toast.error('Erro ao processar solicitação')
      }
    } catch (error) {
      toast.error('Erro ao processar solicitação')
    }
  }

  const handlePrivacySettingChange = async (key: keyof PrivacySettings, value: boolean) => {
    if (!user) return

    const newSettings = { ...privacySettings, [key]: value }
    setPrivacySettings(newSettings)

    try {
      const response = await fetch('/api/profile/privacy-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [key]: value
        })
      })

      if (!response.ok) {
        toast.error('Erro ao salvar configurações')
        setPrivacySettings(privacySettings) // Reverter mudança
      }
    } catch (error) {
      toast.error('Erro ao salvar configurações')
      setPrivacySettings(privacySettings) // Reverter mudança
    }
  }

  const handleSendMessage = async (requesterId: string) => {
    if (!user) return

    try {
      const response = await fetch('/api/start-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: user.id,
          targetId: requesterId
        })
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/messages/${data.conversationId}`)
      } else {
        toast.error('Erro ao iniciar conversa')
      }
    } catch (error) {
      toast.error('Erro ao iniciar conversa')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Eye className="w-6 h-6 text-pink-500" />
              <h1 className="text-xl font-bold text-gray-900">Solicitações de Perfil</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Configurações</span>
              </button>
              <Link
                href="/profile"
                className="text-gray-600 hover:text-pink-500 transition-colors"
              >
                Voltar ao Perfil
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      {showSettings && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Configurações de Privacidade
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={privacySettings.allowProfileRequests}
                  onChange={(e) => handlePrivacySettingChange('allowProfileRequests', e.target.checked)}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-gray-700">Permitir solicitações de visualização</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={privacySettings.autoApproveRequests}
                  onChange={(e) => handlePrivacySettingChange('autoApproveRequests', e.target.checked)}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-gray-700">Aprovar solicitações automaticamente</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={privacySettings.showOnlineStatus}
                  onChange={(e) => handlePrivacySettingChange('showOnlineStatus', e.target.checked)}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-gray-700">Mostrar status online</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={privacySettings.showLastSeen}
                  onChange={(e) => handlePrivacySettingChange('showLastSeen', e.target.checked)}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-gray-700">Mostrar última vez online</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm">
              <span className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span>{stats.pending} pendentes</span>
              </span>
              <span className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>{stats.approved} aprovadas</span>
              </span>
              <span className="flex items-center space-x-2">
                <X className="w-4 h-4 text-red-500" />
                <span>{stats.rejected} rejeitadas</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pendentes ({stats.pending})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'approved'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Aprovadas ({stats.approved})
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rejected'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rejeitadas ({stats.rejected})
            </button>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando solicitações...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma solicitação {activeTab === 'pending' ? 'pendente' : activeTab === 'approved' ? 'aprovada' : 'rejeitada'}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'pending' 
                ? 'Você não tem solicitações pendentes no momento.'
                : activeTab === 'approved'
                ? 'Nenhuma solicitação foi aprovada ainda.'
                : 'Nenhuma solicitação foi rejeitada.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start space-x-4">
                  {/* Requester Photo */}
                  <div className="flex-shrink-0">
                    {request.requesterPhotoURL ? (
                      <Image
                        src={request.requesterPhotoURL}
                        alt={request.requesterName}
                        width={60}
                        height={60}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-15 h-15 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Requester Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {request.requesterName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          @{request.requesterUsername} • {request.requesterAge} anos
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : request.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {request.status === 'pending' ? 'Pendente' : request.status === 'approved' ? 'Aprovada' : 'Rejeitada'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{request.requesterCity}, {request.requesterState}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(request.createdAt)}</span>
                      </div>
                    </div>

                    {request.message && (
                      <p className="text-gray-700 mb-4 italic">
                        &quot;{request.message}&quot;
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleRequestAction(request.id, 'approve')}
                            className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            <span>Aprovar</span>
                          </button>
                          <button
                            onClick={() => handleRequestAction(request.id, 'reject')}
                            className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            <span>Rejeitar</span>
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => handleSendMessage(request.requesterId)}
                        className="flex items-center space-x-2 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Mensagem</span>
                      </button>

                      <Link
                        href={`/profile/${request.requesterId}`}
                        className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Ver Perfil</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 