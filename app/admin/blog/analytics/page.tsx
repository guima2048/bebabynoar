'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BarChart3, Eye, Heart, MessageSquare, TrendingUp, Calendar, Users } from 'lucide-react'

interface AnalyticsData {
  period: string
  totalEvents: number
  eventsByType: Record<string, number>
  topPosts: Array<{
    postId: string
    eventCount: number
    post: {
      id: string
      title: string
      slug: string
      viewsCount: number
      likesCount: number
    }
  }>
  dailyStats: Array<{
    date: string
    event_type: string
    count: number
  }>
  dateRange: {
    start: string
    end: string
  }
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')

  // Verificar se é admin
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user?.id || !session.user.isAdmin) {
      router.push('/admin/login')
    }
  }, [session, status, router])

  // Buscar analytics
  useEffect(() => {
    if (session?.user?.isAdmin) {
      fetchAnalytics()
    }
  }, [session, period])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/blog/analytics?period=${period}`)
      const data = await response.json()
      
      if (data.success) {
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error('Erro ao buscar analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'view':
        return <Eye className="w-5 h-5" />
      case 'like':
        return <Heart className="w-5 h-5" />
      case 'comment':
        return <MessageSquare className="w-5 h-5" />
      default:
        return <BarChart3 className="w-5 h-5" />
    }
  }

  const getMetricColor = (type: string) => {
    switch (type) {
      case 'view':
        return 'bg-blue-100 text-blue-600'
      case 'like':
        return 'bg-pink-100 text-pink-600'
      case 'comment':
        return 'bg-purple-100 text-purple-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!session?.user?.isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics do Blog</h1>
              <p className="text-gray-600">Métricas e insights do blog</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="1d">Último dia</option>
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="1y">Último ano</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {analytics ? (
          <div className="space-y-8">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Eventos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(analytics.totalEvents)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {Object.entries(analytics.eventsByType).map(([type, count]) => (
                <div key={type} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 capitalize">
                        {type === 'view' ? 'Visualizações' :
                         type === 'like' ? 'Likes' :
                         type === 'comment' ? 'Comentários' : type}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(count)}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${getMetricColor(type)}`}>
                      {getMetricIcon(type)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Top Posts */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Posts Mais Populares</h2>
              {analytics.topPosts.length > 0 ? (
                <div className="space-y-4">
                  {analytics.topPosts.map((item, index) => (
                    <div key={item.postId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            <a
                              href={`/blog/${item.post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-pink-600"
                            >
                              {item.post.title}
                            </a>
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {formatNumber(item.post.viewsCount)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {formatNumber(item.post.likesCount)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {formatNumber(item.eventCount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhum post encontrado no período selecionado.
                </p>
              )}
            </div>

            {/* Daily Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas Diárias</h2>
              {analytics.dailyStats.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Data</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Tipo</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Quantidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.dailyStats.map((stat, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-700">
                            {new Date(stat.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getMetricColor(stat.event_type)}`}>
                              {getMetricIcon(stat.event_type)}
                              {stat.event_type === 'view' ? 'Visualizações' :
                               stat.event_type === 'like' ? 'Likes' :
                               stat.event_type === 'comment' ? 'Comentários' : stat.event_type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-700 font-medium">
                            {formatNumber(stat.count)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma estatística encontrada no período selecionado.
                </p>
              )}
            </div>

            {/* Date Range Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Período de Análise</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    De {new Date(analytics.dateRange.start).toLocaleDateString('pt-BR')} 
                    até {new Date(analytics.dateRange.end).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum dado encontrado
            </h3>
            <p className="text-gray-600">
              Não há dados de analytics disponíveis para o período selecionado.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 