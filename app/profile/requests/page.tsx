'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getFirestoreDB } from '@/lib/firebase'
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Heart, Camera, Eye, Check, X, Clock, User, MessageCircle } from 'lucide-react'

interface Request {
  id: string
  type: 'interest' | 'private_photo_request'
  requesterId: string
  requesterUsername: string
  requesterPhotoURL?: string
  status: 'pending' | 'approved' | 'rejected'
  message?: string
  createdAt: any
}

export default function RequestsPage() {
  const { user, loading } = useAuth()
  const [requests, setRequests] = useState<Request[]>([])
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    if (!user) { return }
    fetchRequests()
  }, [user])

  const fetchRequests = async () => {
    if (!user) { return }

    try {
      setLoadingRequests(true)
      
      // Busca solicitações de interesse
      const interestQuery = query(
        collection(db, 'interests'),
        where('targetId', '==', user?.id),
        orderBy('createdAt', 'desc')
      )
      const interestSnap = await getDocs(interestQuery)
      
      // Busca solicitações de fotos privadas
      const photoQuery = query(
        collection(db, 'private_photo_requests'),
        where('targetId', '==', user?.id),
        orderBy('createdAt', 'desc')
      )
      const photoSnap = await getDocs(photoQuery)
      
      const allRequests: Request[] = []
      
      // Processa interesses
      interestSnap.docs.forEach(doc => {
        const data = doc.data()
        allRequests.push({
          id: doc.id,
          type: 'interest',
          requesterId: data.requesterId,
          requesterUsername: data.requesterUsername,
          requesterPhotoURL: data.requesterPhotoURL,
          status: data.status || 'pending',
          message: data.message,
          createdAt: data.createdAt
        })
      })
      
      // Processa solicitações de fotos
      photoSnap.docs.forEach(doc => {
        const data = doc.data()
        allRequests.push({
          id: doc.id,
          type: 'private_photo_request',
          requesterId: data.requesterId,
          requesterUsername: data.requesterUsername,
          requesterPhotoURL: data.requesterPhotoURL,
          status: data.status || 'pending',
          message: data.message,
          createdAt: data.createdAt
        })
      })
      
      // Ordena por data de criação
      allRequests.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
      
      setRequests(allRequests)
    } catch (error) {
      toast.error('Erro ao carregar solicitações')
    } finally {
      setLoadingRequests(false)
    }
  }

  const handleResponse = async (requestId: string, type: string, response: 'approved' | 'rejected') => {
    try {
      const collectionName = type === 'interest' ? 'interests' : 'private_photo_requests'
      const requestRef = doc(db, collectionName, requestId)
      
      await updateDoc(requestRef, {
        status: response,
        respondedAt: new Date().toISOString(),
        respondedBy: user?.id
      })
      
      // Atualiza o estado local
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: response } : req
      ))
      
      toast.success(`Solicitação ${response === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso!`)
      
      // Envia notificação para o solicitante
      await fetch('/api/send-message-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: requests.find(r => r.id === requestId)?.requesterId,
          title: 'Resposta à sua solicitação',
          message: `Sua solicitação foi ${response === 'approved' ? 'aprovada' : 'rejeitada'}`,
          type: 'request_response'
        })
      })
    } catch (error) {
      toast.error('Erro ao responder solicitação')
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) { return '' }
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Agora mesmo'
    } else if (diffInHours < 24) {
      return `Há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `Há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`
    }
  }

  const getRequestIcon = (type: string) => {
    switch (type) {
      case 'interest':
        return <Heart className="w-5 h-5 text-pink-600" />
      case 'private_photo_request':
        return <Camera className="w-5 h-5 text-purple-600" />
      default:
        return <Eye className="w-5 h-5 text-gray-600" />
    }
  }

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'interest':
        return 'Interesse'
      case 'private_photo_request':
        return 'Solicitação de Fotos'
      default:
        return 'Solicitação'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'approved':
        return 'bg-green-100 text-green-700'
      case 'rejected':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') { return true }
    return request.status === filter
  })

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Acesso negado</h2>
        <p className="mb-4">Você precisa estar logado para ver suas solicitações.</p>
        <Link href="/login" className="btn-primary">Entrar</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Solicitações</h1>
        <p className="text-gray-600">Gerencie as solicitações que você recebeu de outros usuários.</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-pink-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas ({requests.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pendentes ({requests.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'approved' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Aprovadas ({requests.filter(r => r.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'rejected' 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rejeitadas ({requests.filter(r => r.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Lista de Solicitações */}
      {loadingRequests ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando solicitações...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {filter === 'all' ? 'Nenhuma solicitação ainda' : 'Nenhuma solicitação encontrada'}
          </h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all' 
              ? 'Quando outros usuários demonstrarem interesse ou solicitarem acesso às suas fotos, elas aparecerão aqui.'
              : 'Não há solicitações com este status.'
            }
          </p>
          {filter === 'all' && (
            <Link href="/explore" className="btn-primary">
              Explorar Perfis
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(request => (
            <div key={request.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start gap-4">
                {/* Avatar do solicitante */}
                <img
                  src={request.requesterPhotoURL || '/avatar.png'}
                  alt={request.requesterUsername}
                  className="w-12 h-12 rounded-full object-cover"
                />
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">
                        {request.requesterUsername}
                      </h3>
                      <div className="flex items-center gap-2">
                        {getRequestIcon(request.type)}
                        <span className="text-sm text-gray-600">
                          {getRequestTypeLabel(request.type)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status === 'pending' ? 'Pendente' : 
                         request.status === 'approved' ? 'Aprovada' : 'Rejeitada'}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(request.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  {request.message && (
                    <p className="text-gray-700 mb-4">{request.message}</p>
                  )}
                  
                  {/* Ações */}
                  {request.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleResponse(request.id, request.type, 'approved')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleResponse(request.id, request.type, 'rejected')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Rejeitar
                      </button>
                      <Link
                        href={`/profile/${request.requesterId}`}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Ver Perfil
                      </Link>
                    </div>
                  )}
                  
                  {request.status !== 'pending' && (
                    <div className="flex gap-3">
                      <Link
                        href={`/profile/${request.requesterId}`}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Ver Perfil
                      </Link>
                      <Link
                        href={`/messages`}
                        className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Enviar Mensagem
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 