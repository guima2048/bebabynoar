'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useNotifications } from '@/contexts/NotificationContext'
import { useAuth } from '@/contexts/AuthContext'
import { Bell, Check, Trash2, Filter, X, Heart, Eye, Camera, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { NotificationProvider } from '@/contexts/NotificationContext'
import NotificationToast from '@/components/NotificationToast'

export default function NotificationsPage() {
  return (
    <NotificationProvider>
      <NotificationToast />
      <NotificationsPageContent />
    </NotificationProvider>
  )
}

function NotificationsPageContent() {
  const { notifications, markAsRead, markAllAsRead, loading } = useNotifications()
  const { user } = useAuth()
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
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
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Acesso negado</h2>
        <p className="mb-4">Você precisa estar logado para ver suas notificações.</p>
        <Link href="/login" className="btn-primary">Entrar</Link>
      </div>
    )
  }

  const filteredNotifications = notifications.filter(notification => {
    // Filtro por status (lida/não lida)
    if (filter === 'unread' && notification.read) { return false }
    if (filter === 'read' && !notification.read) { return false }
    
    // Filtro por tipo
    if (typeFilter !== 'all' && notification.type !== typeFilter) { return false }
    
    return true
  })

  const formatDate = (timestamp: any) => {
    if (!timestamp) { return '' }
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60)
    
    if (diffInMinutes < 1) {
      return 'Agora'
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m atrás`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h atrás`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d atrás`
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
      toast.success('Notificação marcada como lida')
    } catch (error) {
      toast.error('Erro ao marcar notificação como lida')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      toast.success('Todas as notificações foram marcadas como lidas')
    } catch (error) {
      toast.error('Erro ao marcar notificações como lidas')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <Bell className="w-5 h-5 text-blue-500" />
      case 'interest':
        return <Heart className="w-5 h-5 text-pink-500" />
      case 'profile_view':
        return <Eye className="w-5 h-5 text-green-500" />
      case 'private_photo_request':
        return <Camera className="w-5 h-5 text-purple-500" />
      case 'payment_approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'payment_rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notificações</h1>
            <p className="text-gray-600 mt-1">
              {filteredNotifications.length} notificação{filteredNotifications.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {notifications.some(n => !n.read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Check className="w-4 h-4" />
              Marcar todas como lidas
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === 'unread' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Não lidas
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === 'read' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Lidas
              </button>
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os tipos</option>
              <option value="message">Mensagens</option>
              <option value="interest">Interesses</option>
              <option value="profile_view">Visualizações</option>
              <option value="private_photo_request">Solicitações de fotos</option>
              <option value="payment_approved">Pagamentos aprovados</option>
              <option value="payment_rejected">Pagamentos rejeitados</option>
            </select>
          </div>
        </div>

        {/* Lista de notificações */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma notificação
              </h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'Você não tem notificações ainda.' 
                  : 'Nenhuma notificação encontrada com os filtros selecionados.'
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm p-6 transition-all duration-200 ${
                  !notification.read ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Ícone */}
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="capitalize">
                            {notification.type.replace('_', ' ')}
                          </span>
                          <span>
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Ações */}
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Marcar como lida"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 