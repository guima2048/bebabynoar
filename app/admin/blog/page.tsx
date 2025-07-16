'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, BarChart3, MessageSquare, Heart, Calendar, User, Tag, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface BlogStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalViews: number
  totalLikes: number
  totalComments: number
}

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'
  featuredImage?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
  readTime?: number
  viewsCount: number
  likesCount: number
  author: {
    id: string
    name: string
    username: string
  }
  categories: Array<{
    id: string
    name: string
    slug: string
    color: string
  }>
  tags: string[]
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
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'>('ALL')
  const [deletingPost, setDeletingPost] = useState<string | null>(null)

  // Carregar estatísticas
  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [statusFilter])

  const fetchStats = async () => {
    try {
      setLoading(true)
      // Buscar posts para calcular estatísticas
      const response = await fetch('/api/blog/posts?admin=true&limit=1000')
      const data = await response.json()

      if (response.ok) {
        const posts = data.posts || []
        
        const totalPosts = posts.length
        const publishedPosts = posts.filter((post: any) => post.status === 'PUBLISHED').length
        const draftPosts = posts.filter((post: any) => post.status === 'DRAFT').length
        const totalViews = posts.reduce((sum: number, post: any) => sum + (post.viewsCount || 0), 0)
        const totalLikes = posts.reduce((sum: number, post: any) => sum + (post.likesCount || 0), 0)
        const totalComments = posts.reduce((sum: number, post: any) => sum + (post.commentsCount || 0), 0)

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
    } finally {
      setLoading(false)
    }
  }

  const fetchPosts = async () => {
    try {
      setPostsLoading(true)
      const statusParam = statusFilter === 'ALL' ? '' : `&status=${statusFilter}`
      const response = await fetch(`/api/blog/posts?admin=true&limit=1000${statusParam}`)
      const data = await response.json()
      if (response.ok) {
        setPosts(data.posts || [])
      } else {
        toast.error('Erro ao carregar posts')
      }
    } catch (error) {
      toast.error('Erro ao carregar posts')
    } finally {
      setPostsLoading(false)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.')) {
      return
    }
    setDeletingPost(postId)
    try {
      const response = await fetch(`/api/blog/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (response.ok) {
        toast.success('Post excluído com sucesso!')
        setPosts(posts.filter(post => post.id !== postId))
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erro ao excluir post')
      }
    } catch (error) {
      toast.error('Erro ao excluir post')
    } finally {
      setDeletingPost(null)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
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

  const getStatusBadge = (status: string) => {
    const styles = {
      PUBLISHED: 'bg-green-100 text-green-800',
      DRAFT: 'bg-yellow-100 text-yellow-800',
      ARCHIVED: 'bg-gray-100 text-gray-800'
    }
    const labels = {
      PUBLISHED: 'Publicado',
      DRAFT: 'Rascunho',
      ARCHIVED: 'Arquivado'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
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

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    )
  }



  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Blog</h1>
            <p className="text-gray-600 mt-2">Crie e gerencie posts do blog</p>
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
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8">
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

      {/* Listagem de Posts */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="ALL">Todos os Status</option>
              <option value="PUBLISHED">Publicados</option>
              <option value="DRAFT">Rascunhos</option>
              <option value="ARCHIVED">Arquivados</option>
            </select>
          </div>
        </div>
        {postsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Edit className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'ALL' ? 'Nenhum post encontrado' : 'Nenhum post criado'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'Tente ajustar os filtros de busca' 
                : 'Comece criando seu primeiro post do blog'
              }
            </p>
            <Link
              href="/admin/blog/editor"
              className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
            >
              <Plus className="w-4 h-4" />
              Criar Primeiro Post
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPosts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
                      {getStatusBadge(post.status)}
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{post.author.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {post.status === 'PUBLISHED' && post.publishedAt
                            ? `Publicado em ${formatDate(post.publishedAt)}`
                            : `Criado em ${formatDate(post.createdAt)}`
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.viewsCount} visualizações</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        <span>{post.likesCount} likes</span>
                      </div>
                    </div>
                    {post.categories.length > 0 && (
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-sm text-gray-500">Categorias:</span>
                        {post.categories.map((cat) => (
                          <span
                            key={cat.id}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                          >
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Ver post"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/blog/editor?id=${post.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Editar post"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deletingPost === post.id}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Excluir post"
                    >
                      {deletingPost === post.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Fim da listagem de posts */}

      {/* Stats */}
      <div className="mt-6 text-center text-sm text-gray-500">
        {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} encontrado{filteredPosts.length !== 1 ? 's' : ''}
        {searchTerm && ` para "${searchTerm}"`}
        {statusFilter !== 'ALL' && ` com status "${statusFilter}"`}
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
    </div>
  )
} 