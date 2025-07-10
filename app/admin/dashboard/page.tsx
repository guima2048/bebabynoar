'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, UserCheck, Crown, AlertTriangle, Clock, FileText, MessageCircle, TrendingUp, Eye } from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  premiumUsers: number
  pendingReports: number
  pendingContent: number
  totalBlogPosts: number
  activeConversations: number
  newUsersToday: number
  onlineUsers: number
  lastUpdated: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    pendingReports: 0,
    pendingContent: 0,
    totalBlogPosts: 0,
    activeConversations: 0,
    newUsersToday: 0,
    onlineUsers: 0,
    lastUpdated: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setError(null)
      setLoading(true)
      
      const res = await fetch('/api/admin/stats')
      
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      } else {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `Erro ${res.status}: ${res.statusText}`)
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      setError(error instanceof Error ? error.message : 'Erro ao carregar estatísticas')
      // Manter estatísticas zeradas em caso de erro
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        premiumUsers: 0,
        pendingReports: 0,
        pendingContent: 0,
        totalBlogPosts: 0,
        activeConversations: 0,
        newUsersToday: 0,
        onlineUsers: 0,
        lastUpdated: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando estatísticas...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total de Usuários',
      value: typeof stats.totalUsers === 'number' ? stats.totalUsers.toLocaleString() : '0',
      icon: Users,
      color: 'bg-blue-500',
      href: '/admin/users',
      trend: '+12% este mês',
      trendColor: 'text-green-600'
    },
    {
      title: 'Usuários Ativos',
      value: typeof stats.activeUsers === 'number' ? stats.activeUsers.toLocaleString() : '0',
      icon: UserCheck,
      color: 'bg-green-500',
      href: '/admin/users',
      trend: (typeof stats.activeUsers === 'number' && typeof stats.totalUsers === 'number' && stats.totalUsers > 0) ? `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% do total` : '0% do total',
      trendColor: 'text-blue-600'
    },
    {
      title: 'Usuários Premium',
      value: typeof stats.premiumUsers === 'number' ? stats.premiumUsers.toLocaleString() : '0',
      icon: Crown,
      color: 'bg-yellow-500',
      href: '/admin/users',
      trend: (typeof stats.premiumUsers === 'number' && typeof stats.totalUsers === 'number' && stats.totalUsers > 0) ? `${Math.round((stats.premiumUsers / stats.totalUsers) * 100)}% do total` : '0% do total',
      trendColor: 'text-yellow-600'
    },
    {
      title: 'Online Agora',
      value: typeof stats.onlineUsers === 'number' ? stats.onlineUsers.toLocaleString() : '0',
      icon: Eye,
      color: 'bg-green-600',
      href: '/admin/users',
      trend: 'Ativos agora',
      trendColor: 'text-green-600'
    },
    {
      title: 'Denúncias Pendentes',
      value: typeof stats.pendingReports === 'number' ? stats.pendingReports.toLocaleString() : '0',
      icon: AlertTriangle,
      color: 'bg-red-500',
      href: '/admin/reports',
      trend: typeof stats.pendingReports === 'number' && stats.pendingReports > 0 ? 'Precisa atenção' : 'Tudo em ordem',
      trendColor: typeof stats.pendingReports === 'number' && stats.pendingReports > 0 ? 'text-red-600' : 'text-green-600'
    },
    {
      title: 'Conteúdo Pendente',
      value: typeof stats.pendingContent === 'number' ? stats.pendingContent.toLocaleString() : '0',
      icon: Clock,
      color: 'bg-orange-500',
      href: '/admin/pending-content',
      trend: typeof stats.pendingContent === 'number' && stats.pendingContent > 0 ? 'Aguardando moderação' : 'Nada pendente',
      trendColor: typeof stats.pendingContent === 'number' && stats.pendingContent > 0 ? 'text-orange-600' : 'text-green-600'
    },
    {
      title: 'Conversas Ativas',
      value: typeof stats.activeConversations === 'number' ? stats.activeConversations.toLocaleString() : '0',
      icon: MessageCircle,
      color: 'bg-purple-500',
      href: '/admin/users',
      trend: 'Últimos 7 dias',
      trendColor: 'text-purple-600'
    },
    {
      title: 'Posts do Blog',
      value: typeof stats.totalBlogPosts === 'number' ? stats.totalBlogPosts.toLocaleString() : '0',
      icon: FileText,
      color: 'bg-indigo-500',
      href: '/admin/blog',
      trend: 'Publicados',
      trendColor: 'text-indigo-600'
    }
  ]



  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
            <p className="text-gray-600 mt-2">
              Visão geral da plataforma Bebaby App
              {stats.lastUpdated && (
                <span className="text-sm text-gray-500 ml-2">
                  • Última atualização: {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleString('pt-BR') : 'N/A'}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Atualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.slice(0, 4).map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} rounded-lg p-3 text-white`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-medium ${card.trendColor}`}>
                {card.trend}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Estatísticas Secundárias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.slice(4).map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} rounded-lg p-3 text-white`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-medium ${card.trendColor}`}>
                {card.trend}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/reports"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-red-200 transition-colors">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Revisar Denúncias</p>
              <p className="text-sm text-gray-600">{stats.pendingReports} pendentes</p>
            </div>
          </Link>

          <Link
            href="/admin/pending-content"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-orange-200 transition-colors">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Moderar Conteúdo</p>
              <p className="text-sm text-gray-600">{stats.pendingContent} pendentes</p>
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Gerenciar Usuários</p>
              <p className="text-sm text-gray-600">{stats.totalUsers} usuários</p>
            </div>
          </Link>

          <Link
            href="/admin/blog"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-indigo-200 transition-colors">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Gerenciar Blog</p>
              <p className="text-sm text-gray-600">{stats.totalBlogPosts} posts</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Informações do Sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Status dos Serviços</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Firebase</span>
              </div>
              <span className="text-sm text-green-600 font-medium">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Brevo (E-mail)</span>
              </div>
              <span className="text-sm text-green-600 font-medium">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Storage</span>
              </div>
              <span className="text-sm text-green-600 font-medium">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">API</span>
              </div>
              <span className="text-sm text-green-600 font-medium">Online</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Atividade Recente</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Novos usuários hoje</span>
              <span className="text-sm font-medium text-blue-600">{stats.newUsersToday}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Conversas ativas</span>
              <span className="text-sm font-medium text-purple-600">{stats.activeConversations}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Usuários online</span>
              <span className="text-sm font-medium text-green-600">{stats.onlineUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Taxa de conversão</span>
              <span className="text-sm font-medium text-yellow-600">
                {Math.round((stats.premiumUsers / stats.totalUsers) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 