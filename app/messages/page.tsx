'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Search, MessageCircle, Crown, Shield, Clock, User, Filter, MoreVertical, Heart, Users, Star, TrendingUp, Menu } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import EmptyMessages from '@/components/EmptyMessages'
import MessagesOnboarding from '@/components/MessagesOnboarding'


interface Conversation {
  id: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  user: {
    id: string
    username: string
    photoURL?: string
    userType: string
    premium: boolean
    verified: boolean
    online: boolean
  }
}

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'online'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [stats, setStats] = useState({
    totalConversations: 0,
    unreadMessages: 0,
    onlineUsers: 0
  })

  useEffect(() => {
    console.log('🔍 MessagesPage - Auth state:', { user, authLoading })
    
    if (authLoading) {
      console.log('⏳ Auth ainda carregando...')
      return
    }
    
    if (!user) {
      console.log('❌ Usuário não autenticado')
      setLoading(false)
      return
    }
    
    console.log('✅ Usuário autenticado:', user)
    loadConversations()
  }, [user, authLoading])

  const loadConversations = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Buscar conversas via API
      const response = await fetch('/api/conversations')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar conversas')
      }
      
      const data = await response.json()
      const conversationsData: Conversation[] = data.conversations.map((conv: any) => ({
        id: conv.id,
        lastMessage: conv.lastMessage || '',
        lastMessageTime: new Date(conv.lastMessageTime),
        unreadCount: conv.unreadCount || 0,
        user: {
          id: conv.participant.id,
          username: conv.participant.username || conv.participant.name || 'Usuário',
          photoURL: conv.participant.photoURL,
          userType: 'user',
          premium: conv.participant.premium || false,
          verified: conv.participant.verified || false,
          online: false
        }
      }))
      
      setConversations(conversationsData)
      
      // Calcular estatísticas
      const totalConversations = conversationsData.length
      const unreadMessages = conversationsData.reduce((sum, conv) => sum + conv.unreadCount, 0)
      const onlineUsers = conversationsData.filter(conv => conv.user.online).length
      
      setStats({
        totalConversations,
        unreadMessages,
        onlineUsers
      })
      
    } catch (error) {
      console.error('Erro ao carregar conversas:', error)
      toast.error('Erro ao carregar conversas')
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.user.username.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && conversation.unreadCount > 0) ||
      (filter === 'online' && conversation.user.online)
    
    return matchesSearch && matchesFilter
  })

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) return 'Agora'
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h`
    if (diffInHours < 48) return 'Ontem'
    return timestamp.toLocaleDateString('pt-BR')
  }

  // Estado de carregamento da autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando autenticação...</p>
        </div>
      </div>
    )
  }

  // Usuário não autenticado
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-6">Você precisa estar logado para acessar as mensagens</p>
          <Link href="/login" className="btn-primary w-full">
            Fazer Login
          </Link>
        </div>
      </div>
    )
  }

  // Carregamento das conversas
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-4xl mx-auto p-4">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-6 md:hidden">
            <h1 className="text-2xl font-bold text-gray-900">Mensagens</h1>
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
          
          {/* Desktop Header */}
          <div className="hidden md:block mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mensagens</h1>
            <p className="text-gray-600">Conecte-se com outros usuários</p>
          </div>
          
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-white rounded-xl shadow-sm"></div>
              ))}
            </div>
            <div className="h-12 bg-white rounded-xl shadow-sm"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-xl shadow-sm"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  console.log('🎨 Renderizando página com usuário:', user)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mensagens</h1>
            <p className="text-sm text-gray-500">
              {user.name} ({user.userType})
            </p>
          </div>
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        
        {/* Desktop Header */}
        <div className="hidden md:block mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mensagens</h1>
          <p className="text-gray-600">Conecte-se com outros usuários</p>
          <p className="text-sm text-gray-500 mt-2">
            Logado como: {user.name} ({user.userType})
          </p>
        </div>

        {/* Stats Cards - Mobile */}
        <div className="grid grid-cols-3 gap-3 mb-6 md:hidden">
          <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
            <div className="text-center">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <MessageCircle className="w-4 h-4 text-pink-600" />
              </div>
              <p className="text-xs text-gray-600">Conversas</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalConversations}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
            <div className="text-center">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Heart className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-xs text-gray-600">Não lidas</p>
              <p className="text-lg font-bold text-gray-900">{stats.unreadMessages}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
            <div className="text-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-xs text-gray-600">Online</p>
              <p className="text-lg font-bold text-gray-900">{stats.onlineUsers}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards - Desktop */}
        <div className="hidden md:grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Conversas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalConversations}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Não lidas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Online</p>
                <p className="text-2xl font-bold text-gray-900">{stats.onlineUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 hidden sm:inline">Filtros</span>
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'Todas' },
                  { key: 'unread', label: 'Não lidas' },
                  { key: 'online', label: 'Online' }
                ].map((filterOption) => (
                  <button
                    key={filterOption.key}
                    onClick={() => setFilter(filterOption.key as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === filterOption.key
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filterOption.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Onboarding for new users */}
        {conversations.length === 0 && (
          <MessagesOnboarding userType={user?.userType} />
        )}

        {/* Conversations List */}
        {conversations.length > 0 && (
          <div className="space-y-3">
            {filteredConversations.length === 0 ? (
              <EmptyMessages 
                type="conversations" 
                searchTerm={searchTerm} 
                filter={filter} 
              />
            ) : (
              filteredConversations.map((conversation) => (
                <Link
                  key={conversation.id}
                  href={`/messages/${conversation.user.id}`}
                  className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={conversation.user.photoURL || '/avatar.png'}
                          alt={conversation.user.username}
                          className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-gray-200"
                        />
                        {conversation.user.online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 truncate text-sm md:text-base">
                              {conversation.user.username}
                            </h3>
                            {conversation.user.verified && (
                              <Shield className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
                            )}
                            {conversation.user.premium && (
                              <Crown className="w-3 h-3 md:w-4 md:h-4 text-yellow-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                            <Clock className="w-3 h-3 md:w-4 md:h-4" />
                            <span>{formatTime(conversation.lastMessageTime)}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-xs md:text-sm truncate mb-1">
                          {conversation.lastMessage}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 capitalize">
                            {conversation.user.userType.replace('_', ' ')}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-pink-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Footer Stats */}
        {conversations.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{filteredConversations.length} conversa{filteredConversations.length !== 1 ? 's' : ''}</span>
              <span>
                {conversations.filter(c => c.unreadCount > 0).length} não lida{conversations.filter(c => c.unreadCount > 0).length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Debug Info - Only in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <pre className="text-xs text-gray-600">
              {JSON.stringify({
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  userType: user.userType
                },
                authLoading,
                loading,
                searchTerm,
                filter,
                conversationsCount: conversations.length,
                filteredCount: filteredConversations.length
              }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
} 