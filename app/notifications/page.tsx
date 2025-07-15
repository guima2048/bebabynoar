'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { 
  Bell, 
  Heart, 
  Eye, 
  MessageCircle, 
  Star, 
  Users,
  Check,
  X,
  Clock,
  Filter
} from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'like' | 'view' | 'message' | 'match' | 'premium' | 'system'
  read: boolean
  createdAt: Date
  data?: any
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'likes' | 'views' | 'messages'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    likes: 0,
    views: 0,
    messages: 0
  })

  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (user) {
      loadNotifications()
    }
  }, [user, authLoading, router])

  useEffect(() => {
    // Garante fundo escuro no body e html apenas nesta página
    document.body.style.background = '#18181b';
    document.documentElement.style.background = '#18181b';
    return () => {
      document.body.style.background = '';
      document.documentElement.style.background = '';
    };
  }, []);

  const loadNotifications = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch('/api/notifications')
      const data = await response.json()

      if (response.ok) {
        setNotifications(data.notifications || [])
        setStats({
          total: data.notifications?.length || 0,
          unread: data.unreadCount || 0,
          likes: data.likesCount || 0,
          views: data.viewsCount || 0,
          messages: data.messagesCount || 0
        })
      } else {
        toast.error('Erro ao carregar notificações')
      }
    } catch (error) {
      toast.error('Erro ao carregar notificações')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, read: true }
              : notif
          )
        )
        setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }))
      }
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST'
      })

      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
        setStats(prev => ({ ...prev, unread: 0 }))
        toast.success('Todas as notificações foram marcadas como lidas')
      }
    } catch (error) {
      toast.error('Erro ao marcar todas como lidas')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />
      case 'view':
        return <Eye className="w-5 h-5 text-blue-500" />
      case 'message':
        return <MessageCircle className="w-5 h-5 text-green-500" />
      case 'match':
        return <Star className="w-5 h-5 text-yellow-500" />
      case 'premium':
        return <Star className="w-5 h-5 text-purple-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'like':
        return 'bg-red-600/20 border-red-600/30'
      case 'view':
        return 'bg-blue-600/20 border-blue-600/30'
      case 'message':
        return 'bg-green-600/20 border-green-600/30'
      case 'match':
        return 'bg-yellow-600/20 border-yellow-600/30'
      case 'premium':
        return 'bg-purple-600/20 border-purple-600/30'
      default:
        return 'bg-gray-600/20 border-gray-600/30'
    }
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Agora'
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`
    return `${Math.floor(diffInMinutes / 1440)}d atrás`
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.read
    if (filter === 'likes') return notification.type === 'like'
    if (filter === 'views') return notification.type === 'view'
    if (filter === 'messages') return notification.type === 'message'
    return true
  })

  // Estado de carregamento da autenticação
  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 bg-[#18181b] min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Usuário não autenticado
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center bg-[#18181b] min-h-screen text-white">
        <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
        <p className="mb-6">Você precisa estar logado para ver as notificações</p>
        <Link href="/login" className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors">
          Fazer Login
        </Link>
      </div>
    )
  }

  // Carregamento das notificações
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 bg-[#18181b] min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 bg-[#18181b] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-pink-500" />
            <h1 className="text-3xl font-bold text-white">Notificações</h1>
          </div>
          {stats.unread > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-pink-500 hover:text-pink-400 transition-colors"
            >
              Marcar todas como lidas
            </button>
          )}
        </div>
        <p className="text-gray-400">Mantenha-se atualizado sobre suas atividades</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#232326] rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-600/20 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#232326] rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Curtidas</p>
              <p className="text-2xl font-bold text-white">{stats.likes}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#232326] rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Visualizações</p>
              <p className="text-2xl font-bold text-white">{stats.views}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#232326] rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Mensagens</p>
              <p className="text-2xl font-bold text-white">{stats.messages}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#232326] rounded-lg p-4 mb-8 border border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-white"
          >
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-gray-300">Filtros</span>
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-600">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'Todas' },
                { key: 'unread', label: 'Não lidas' },
                { key: 'likes', label: 'Curtidas' },
                { key: 'views', label: 'Visualizações' },
                { key: 'messages', label: 'Mensagens' }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === filterOption.key
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-[#232326] rounded-lg p-8 text-center border border-gray-700">
          <Bell className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            {filter === 'all' ? 'Nenhuma notificação' : 'Nenhuma notificação encontrada'}
          </h3>
          <p className="text-gray-400">
            {filter === 'all' 
              ? 'Você ainda não tem notificações. Continue usando a plataforma para receber atualizações!'
              : 'Não há notificações com este filtro.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-[#232326] rounded-lg p-4 border transition-colors ${
                notification.read 
                  ? 'border-gray-700' 
                  : 'border-pink-500/50 bg-pink-500/5'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white truncate">
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {formatTime(notification.createdAt)}
                      </span>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-3">
                    {notification.message}
                  </p>
                  
                  {!notification.read && (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                      <span className="text-xs text-pink-400">Nova</span>
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