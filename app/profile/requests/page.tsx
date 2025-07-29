'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, Check, X, Clock, User, Calendar, MapPin, Heart, MessageCircle, Settings, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'
import { Toaster } from 'react-hot-toast'
import SidebarMenuWrapper from '../../../components/SidebarMenuWrapper';

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

interface AuthUser { id: string; username?: string; userType?: string; [key: string]: any }

// Função utilitária para sanitizar texto
function sanitizeText(text: string) {
  if (!text) return ''
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export default function RequestsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [requests, setRequests] = useState<ProfileRequest[]>([])
  const [sentRequests, setSentRequests] = useState<ProfileRequest[]>([])
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
  // Adicionar estado de loading para ações
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [messageLoading, setMessageLoading] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Função para buscar solicitações reais
  const fetchRequests = async () => {
    setLoading(true)
    try {
      const headers = new Headers()
      if (session?.user?.id) headers.append('x-user-id', session.user.id)
      const response = await fetch('/api/user/profile/requests', { headers })
      const data = await response.json()
      if (response.ok) {
        setRequests(data.received || [])
        setSentRequests(data.sent || [])
      } else {
        toast.error(data.message || 'Erro ao buscar solicitações')
      }
    } catch (e) {
      toast.error('Erro de conexão ao buscar solicitações')
    } finally {
      setLoading(false)
    }
  }

  // Função para aprovar/rejeitar
  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    setActionLoading(requestId + '-' + action)
    try {
      const headers = new Headers()
      headers.append('Content-Type', 'application/json')
      if (session?.user?.id) headers.append('x-user-id', session.user.id)
      const response = await fetch('/api/user/profile/requests', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ requestId, action })
      })
      const data = await response.json()
      if (response.ok) {
        toast.success(data.message)
        fetchRequests()
      } else {
        toast.error(data.message || 'Erro ao processar solicitação')
      }
    } catch (e) {
      toast.error('Erro de conexão ao processar solicitação')
    } finally {
      setActionLoading(null)
    }
  }

  // Função para enviar nova solicitação
  const handleSendRequest = async (targetUserId: string, message: string) => {
    setSending(true)
    try {
      const headers = new Headers()
      headers.append('Content-Type', 'application/json')
      if (session?.user?.id) headers.append('x-user-id', session.user.id)
      const response = await fetch('/api/user/profile/requests', {
        method: 'POST',
        headers,
        body: JSON.stringify({ targetUserId, message })
      })
      const data = await response.json()
      if (response.ok) {
        toast.success(data.message)
        fetchRequests()
      } else {
        toast.error(data.message || 'Erro ao enviar solicitação')
      }
    } catch (e) {
      toast.error('Erro de conexão ao enviar solicitação')
    } finally {
      setSending(false)
    }
  }

  const loadPrivacySettings = async (user: any) => {
    if (!user) return
    try {
      const response = await fetch('/api/profile/privacy-settings', {
        headers: {
          'x-user-id': user.id
        }
      })
      const data = await response.json()
      if (response.ok) {
        setPrivacySettings(data.settings)
      }
    } catch (error) {
      // console.error('Erro ao carregar configurações de privacidade')
    }
  }

  // Enviar mensagem
  const handleSendMessage = async (requesterId: string) => {
    if (!session?.user) return
    setMessageLoading(requesterId)
    try {
      const response = await fetch('/api/start-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: session.user.id,
          targetId: requesterId
        })
      })
      const data = await response.json()
      if (response.ok) {
        toast.success('Conversa iniciada!')
        router.push(`/messages/${data.conversationId}`)
      } else {
        toast.error(data.message || 'Não foi possível iniciar a conversa.')
      }
    } catch (error) {
      toast.error('Erro ao iniciar conversa. Tente novamente.')
    } finally {
      setMessageLoading(null)
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated' && session?.user) {
      loadPrivacySettings(session.user)
      fetchRequests()
    }
  }, [status, session, router, activeTab])

  // Substituir loading e estados vazios
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#18181b]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-500 border-solid mb-4"></div>
        <span className="text-white text-lg">Carregando solicitações...</span>
      </div>
    )
  }
  if (status === 'unauthenticated' || !session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Exibir mensagem amigável se não houver solicitações
  const hasRequests = requests.length > 0
  const hasSentRequests = sentRequests.length > 0

  return (
    <>
      <SidebarMenuWrapper />
      <div className="min-h-screen bg-[#18181b] flex flex-col items-center w-full max-w-full px-2 py-4">
        {/* Privacy Settings */}
        {showSettings && (
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Configurações de Privacidade
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={privacySettings.allowProfileRequests}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, allowProfileRequests: e.target.checked })}
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    aria-label="Permitir solicitações de visualização"
                  />
                  <span className="text-gray-200">Permitir solicitações de visualização</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={privacySettings.autoApproveRequests}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, autoApproveRequests: e.target.checked })}
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    aria-label="Aprovar solicitações automaticamente"
                  />
                  <span className="text-gray-200">Aprovar solicitações automaticamente</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={privacySettings.showOnlineStatus}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, showOnlineStatus: e.target.checked })}
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    aria-label="Mostrar status online"
                  />
                  <span className="text-gray-200">Mostrar status online</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={privacySettings.showLastSeen}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, showLastSeen: e.target.checked })}
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    aria-label="Mostrar última vez online"
                  />
                  <span className="text-gray-200">Mostrar última vez online</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="bg-[#232326] border-b border-pink-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm">
                <span className="flex items-center space-x-2 text-white">
                  <Clock className="w-4 h-4 text-yellow-400" />
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
        <div className="bg-[#232326] border-b border-pink-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                aria-label="Ver solicitações pendentes"
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
                aria-label="Ver solicitações aprovadas"
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
                aria-label="Ver solicitações rejeitadas"
              >
                Rejeitadas ({stats.rejected})
              </button>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="w-full max-w-md mx-auto flex flex-col gap-4">
          {!hasRequests && !hasSentRequests && (
            <div className="flex flex-col items-center justify-center py-16">
              <span className="text-pink-400 text-2xl mb-2">Nenhuma solicitação encontrada</span>
              <span className="text-gray-400">Você ainda não recebeu nem enviou solicitações de acesso ao perfil.</span>
            </div>
          )}
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhuma solicitação {activeTab === 'pending' ? 'pendente' : activeTab === 'approved' ? 'aprovada' : 'rejeitada'}
              </h3>
              <p className="text-gray-300">
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
                <div key={request.id} className="bg-[#232326] rounded-2xl shadow-lg border-4 border-pink-500/30 p-4 flex flex-col items-center gap-2 w-full break-words">
                  <div className="flex-shrink-0 flex justify-center items-center w-full mb-2">
                    <div className="relative">
                      {request.requesterPhotoURL ? (
                        <Image
                          src={request.requesterPhotoURL}
                          alt={`Foto do usuário ${request.requesterName || 'solicitante'}`}
                          width={80}
                          height={80}
                          className="rounded-full object-cover border-4 border-pink-400 shadow-md w-20 h-20"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-[#232326] rounded-full flex items-center justify-center border-4 border-pink-400">
                          <User className="w-10 h-10 text-gray-500" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Requester Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-lg font-bold text-white text-center">
                          {sanitizeText(request.requesterName)}
                        </h4>
                        <p className="text-base text-pink-300 text-center font-mono break-words">
                          @{request.requesterUsername} • {request.requesterAge} anos
                        </p>
                      </div>
                      <div className="flex justify-center mt-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm ${
                          request.status === 'pending'
                            ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-500'
                            : request.status === 'approved'
                            ? 'bg-green-400/20 text-green-300 border border-green-500'
                            : 'bg-red-400/20 text-red-300 border border-red-500'
                        }`}>
                          {request.status === 'pending' ? 'Pendente' : request.status === 'approved' ? 'Aprovada' : 'Rejeitada'}
                        </span>
                      </div>
                    </div>

                    {/* Info do solicitante em grid, centralizado */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-300 mb-3 w-full max-w-xs mx-auto">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{request.requesterCity}, {request.requesterState}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(request.createdAt)}</span>
                      </div>
                    </div>

                    {/* Mensagem em seção separada, destaque */}
                    {request.message && (
                      <div className="w-full bg-[#18181b] rounded-lg border border-pink-900/30 p-2 mb-2 text-pink-200 text-center italic shadow-sm break-words">
                        &quot;{sanitizeText(request.message)}&quot;
                      </div>
                    )}

                    {/* Ações em grid, espaçamento generoso */}
                    <div className="grid grid-cols-1 gap-2 w-full mt-4">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleRequestAction(request.id, 'approve')}
                            className="flex items-center justify-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-full shadow hover:bg-pink-500 transition-all duration-150 focus:ring-4 focus:ring-pink-400 focus:outline-none w-full text-base font-bold"
                            aria-label="Aprovar solicitação"
                            disabled={actionLoading === request.id + '-approve'}
                          >
                            {actionLoading === request.id + '-approve' ? (
                              <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-white border-solid" aria-label="Carregando aprovação"></span>
                            ) : <><Check className="w-4 h-4" /><span>Aprovar</span></>}
                          </button>
                          <button
                            onClick={() => handleRequestAction(request.id, 'reject')}
                            className="flex items-center justify-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-full shadow hover:bg-pink-500 transition-all duration-150 focus:ring-4 focus:ring-pink-400 focus:outline-none w-full text-base font-bold"
                            aria-label="Rejeitar solicitação"
                            disabled={actionLoading === request.id + '-reject'}
                          >
                            {actionLoading === request.id + '-reject' ? (
                              <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-white border-solid" aria-label="Carregando rejeição"></span>
                            ) : <><X className="w-4 h-4" /><span>Rejeitar</span></>}
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => handleSendMessage(request.requesterId)}
                        className="flex items-center justify-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-full shadow hover:bg-pink-500 transition-all duration-150 focus:ring-4 focus:ring-pink-400 focus:outline-none w-full text-base font-bold"
                        aria-label="Enviar mensagem para solicitante"
                        disabled={messageLoading === request.requesterId}
                      >
                        {messageLoading === request.requesterId ? (
                          <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-white border-solid" aria-label="Carregando envio de mensagem"></span>
                        ) : <><MessageCircle className="w-4 h-4" /><span>Mensagem</span></>}
                      </button>

                      <Link
                        href={`/profile/${request.requesterId}`}
                        className="flex items-center justify-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-full shadow hover:bg-pink-500 transition-all duration-150 focus:ring-4 focus:ring-pink-400 focus:outline-none w-full text-base font-bold"
                        aria-label="Ver perfil do solicitante"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Ver Perfil</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Toaster
          position="top-center"
          toastOptions={{
            className: 'text-sm',
            duration: 4000,
            style: { background: '#18181b', color: '#fff' },
          }}
          containerStyle={{ zIndex: 9999 }}
          aria-live="polite"
        />
      </div>
    </>
  )
} 