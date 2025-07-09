'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, BarChart3, MessageSquare, Heart } from 'lucide-react'
import Link from 'next/link'

interface BlogStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalViews: number
  totalLikes: number
  totalComments: number
}

export default function AdminBlogPage() {
  const [stats, setStats] = useState<BlogStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
  })
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Verificar autenticação
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/check-auth')
      if (response.ok) {
        const data = await response.json()
        if (data.authenticated) {
          setIsAuthenticated(true)
          fetchStats()
        } else {
          // Redirecionar para login com parâmetro de retorno
          window.location.href = '/admin/?redirect=/admin/blog'
        }
      } else {
        // Redirecionar para login com parâmetro de retorno
        window.location.href = '/admin/?redirect=/admin/blog'
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      // Redirecionar para login com parâmetro de retorno
      window.location.href = '/admin/?redirect=/admin/blog'
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Buscar posts para calcular estatísticas
      const response = await fetch('/api/blog/posts?admin=true&limit=1000')
      const data = await response.json()

      if (response.ok) {
        const posts = data.posts || []
        
        const totalPosts = posts.length
        const publishedPosts = posts.filter((post: any) => post.status === 'PUBLISHED').length
        const draftPosts = posts.filter((post: any) => post.status === 'DRAFT').length
        const totalViews = posts.reduce((sum: number, post: any) => sum + post._count.views, 0)
        const totalLikes = posts.reduce((sum: number, post: any) => sum + post._count.likes, 0)
        const totalComments = posts.reduce((sum: number, post: any) => sum + post._count.comments, 0)

        setStats({
          totalPosts,
          publishedPosts,
          draftPosts,
          totalViews,
          totalLikes,
          totalComments,
        })
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' })
      setIsAuthenticated(false)
      window.location.href = '/admin/'
    } catch (error) {
      console.error('Erro no logout:', error)
    }
  }

  const createSamplePosts = async () => {
    try {
      const response = await fetch('/api/blog/seed', {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        alert('Posts de exemplo criados com sucesso!')
        fetchStats() // Atualizar estatísticas
      } else {
        alert(data.error || 'Erro ao criar posts de exemplo')
      }
    } catch (error) {
      console.error('Erro ao criar posts de exemplo:', error)
      alert('Erro ao criar posts de exemplo')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Você precisa estar logado como administrador.</p>
          <Link
            href="/admin/?redirect=/admin/blog"
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Voltar ao Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gerenciar Blog</h1>
                <p className="text-gray-600">Crie e gerencie posts do blog</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={createSamplePosts}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                🌱 Criar Posts de Exemplo
              </button>
              <Link
                href="/admin/blog/editor"
                className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Novo Post
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Posts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Publicados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.publishedPosts}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rascunhos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.draftPosts}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Edit className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Visualizações</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="container mx-auto px-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/blog/editor"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-colors"
            >
              <div className="p-2 bg-pink-100 rounded-lg">
                <Plus className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Criar Post</h3>
                <p className="text-sm text-gray-600">Escrever novo artigo</p>
              </div>
            </Link>

            <Link
              href="/admin/blog/posts"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <Edit className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Gerenciar Posts</h3>
                <p className="text-sm text-gray-600">Editar e excluir posts</p>
              </div>
            </Link>

            <Link
              href="/admin/blog/categories"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-colors"
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Categorias</h3>
                <p className="text-sm text-gray-600">Gerenciar categorias</p>
              </div>
            </Link>

            <Link
              href="/admin/blog/comments"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-colors"
            >
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Comentários</h3>
                <p className="text-sm text-gray-600">Moderar comentários</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="container mx-auto px-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Posts Recentes</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Como Encontrar um Sugar Daddy Ideal</h3>
                <p className="text-sm text-gray-600">Publicado em 15/01/2024</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Publicado</span>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Finanças Pessoais para Sugar Babies</h3>
                <p className="text-sm text-gray-600">Publicado em 10/01/2024</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Publicado</span>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Viagens e Experiências Únicas</h3>
                <p className="text-sm text-gray-600">Rascunho</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Rascunho</span>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 