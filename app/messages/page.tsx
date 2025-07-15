'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { 
  MessageCircle, 
  Search, 
  Filter, 
  Heart, 
  Users, 
  Menu,
  Send,
  Clock,
  Eye
} from 'lucide-react'

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

  useEffect(() => {
    // Garante fundo escuro no body e html apenas nesta página
    document.body.style.background = '#18181b';
    document.documentElement.style.background = '#18181b';
    return () => {
      document.body.style.background = '';
      document.documentElement.style.background = '';
    };
  }, []);

  const loadConversations = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch('/api/conversations')
      const data = await response.json()

      if (response.ok) {
        setConversations(data.conversations || [])
        setStats({
          totalConversations: data.conversations?.length || 0,
          unreadMessages: data.unreadCount || 0,
          onlineUsers: data.onlineUsers || 0
        })
      } else {
        toast.error('Erro ao carregar conversas')
      }
    } catch (error) {
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
      <div className="max-w-4xl mx-auto py-12 px-4 bg-[#18181b] min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[...Array(3)].map((_, i) => (
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
        <p className="mb-6">Você precisa estar logado para acessar as mensagens</p>
        <Link href="/login" className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors">
          Fazer Login
        </Link>
      </div>
    )
  }

  // Carregamento das conversas
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 bg-[#18181b] min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[...Array(3)].map((_, i) => (
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

  console.log('🎨 Renderizando página com usuário:', user)

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 bg-[#18181b] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Mensagens</h1>
        <p className="text-gray-400">Conecte-se com outros usuários</p>
        <p className="text-sm text-gray-500 mt-2">
          Logado como: {user.name} ({user.userType})
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#232326] rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-600/20 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Conversas</p>
              <p className="text-2xl font-bold text-white">{stats.totalConversations}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#232326] rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Não lidas</p>
              <p className="text-2xl font-bold text-white">{stats.unreadMessages}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#232326] rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Online</p>
              <p className="text-2xl font-bold text-white">{stats.onlineUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#232326] rounded-lg p-4 mb-8 border border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-white"
          >
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-gray-300 hidden sm:inline">Filtros</span>
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-600">
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

      {/* Onboarding for new users */}
      {conversations.length === 0 && (
        <div className="bg-[#232326] rounded-lg p-8 text-center border border-gray-700">
          <MessageCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhuma conversa ainda</h3>
          <p className="text-gray-400 mb-6">
            Comece a conversar com outros usuários para ver suas mensagens aqui
          </p>
          <Link 
            href="/explore" 
            className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors inline-flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Explorar Usuários
          </Link>
        </div>
      )}

      {/* Conversations List */}
      {conversations.length > 0 && (
        <div className="space-y-4">
          {filteredConversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/messages/${conversation.id}`}
              className="block bg-[#232326] rounded-lg p-4 border border-gray-700 hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={
                      conversation.user.photoURL ||
                      (conversation.user.userType === 'SUGAR_BABY' 
                        ? '/landing/padraomulher.webp' 
                        : '/landing/padraohomem.webp')
                    }
                    alt={conversation.user.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {conversation.user.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#232326]"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-semibold truncate">
                      {conversation.user.username}
                    </h3>
                    <div className="flex items-center gap-2">
                      {conversation.user.premium && (
                        <span className="text-yellow-500 text-xs">⭐</span>
                      )}
                      {conversation.user.verified && (
                        <span className="text-blue-500 text-xs">✓</span>
                      )}
                      <span className="text-xs text-gray-400">
                        {formatTime(conversation.lastMessageTime)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm truncate mb-1">
                    {conversation.lastMessage}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {conversation.user.userType}
                    </span>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-pink-600 text-white text-xs px-2 py-1 rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 