'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, Calendar, User, Tag, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

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
  author: {
    id: string
    name: string
    username: string
  }
  categories: Array<{
    category: {
      id: string
      name: string
      slug: string
    }
  }>
  _count: {
    views: number
    likes: number
    comments: number
  }
}

export default function AdminBlogPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'>('ALL')
  const [deletingPost, setDeletingPost] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [statusFilter])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const statusParam = statusFilter === 'ALL' ? '' : `&status=${statusFilter}`
      const response = await fetch(`/api/blog/posts?admin=true&limit=1000${statusParam}`)
      const data = await response.json()

      if (response.ok) {
        setPosts(data.posts || [])
      } else {
        toast.error('Erro ao carregar posts')
      }
    } catch (error) {
      console.error('Erro ao buscar posts:', error)
      toast.error('Erro ao carregar posts')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.')) {
      return
    }

    setDeletingPost(postId)
    try {
      const response = await fetch(`/api/blog/posts/${postId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Post excluído com sucesso!')
        setPosts(posts.filter(post => post.id !== postId))
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erro ao excluir post')
      }
    } catch (error) {
      console.error('Erro ao excluir post:', error)
      toast.error('Erro ao excluir post')
    } finally {
      setDeletingPost(null)
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Posts</h1>
            <p className="text-gray-600 mt-2">Edite e exclua posts do blog</p>
          </div>
          <Link
            href="/admin/blog/editor"
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Post
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
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

          {/* Status Filter */}
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
      </div>

      {/* Posts List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredPosts.length === 0 ? (
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
                        <span>{post._count.views} visualizações</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        <span>{post._count.likes} likes</span>
                      </div>
                    </div>

                    {/* Categories */}
                    {post.categories.length > 0 && (
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-sm text-gray-500">Categorias:</span>
                        {post.categories.map((cat) => (
                          <span
                            key={cat.category.id}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                          >
                            {cat.category.name}
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

      {/* Stats */}
      <div className="mt-6 text-center text-sm text-gray-500">
        {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} encontrado{filteredPosts.length !== 1 ? 's' : ''}
        {searchTerm && ` para "${searchTerm}"`}
        {statusFilter !== 'ALL' && ` com status "${statusFilter}"`}
      </div>
    </div>
  )
} 