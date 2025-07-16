'use client'

import { useState, useEffect } from 'react'
import PostCard from './PostCard'
import { Search, Filter, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string
  featuredImage?: string
  publishedAt?: Date
  author: {
    id: string
    name?: string
    username: string
    photoURL?: string
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

interface PostListProps {
  initialPosts?: Post[]
  showFilters?: boolean
  showSearch?: boolean
  showPagination?: boolean
  layout?: 'grid' | 'list' | 'featured' | 'sidebar'
  categoryId?: string
  authorId?: string
  limit?: number
}

export default function PostList({
  initialPosts = [],
  showFilters = true,
  showSearch = true,
  showPagination = true,
  layout = 'grid',
  categoryId,
  authorId,
  limit = 12
}: PostListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categoryId || '')
  const [selectedStatus, setSelectedStatus] = useState('PUBLISHED')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(layout === 'featured' ? 'grid' : (layout === 'sidebar' ? 'grid' : layout))
  const [categories, setCategories] = useState<Array<{ id: string; name: string; color: string }>>([])

  // Buscar categorias
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/blog/categories')
        const data = await response.json()
        if (data.success) {
          setCategories(data.categories)
        }
      } catch (error) {
        console.error('Erro ao buscar categorias:', error)
      }
    }

    if (showFilters && layout !== 'sidebar') {
      fetchCategories()
    }
  }, [showFilters, layout])

  // Buscar posts
  const fetchPosts = async (page = 1, filters = {}) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      })

      const response = await fetch(`/api/blog/posts?${params}`)
      const data = await response.json()

      if (response.ok) {
        setPosts(data.posts)
        setTotalPages(data.pagination.pages)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Erro ao buscar posts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Aplicar filtros
  const applyFilters = () => {
    const filters: any = {}
    
    if (searchTerm) filters.search = searchTerm
    if (selectedCategory) filters.categoryId = selectedCategory
    if (selectedStatus) filters.status = selectedStatus
    if (authorId) filters.authorId = authorId

    fetchPosts(1, filters)
  }

  // Resetar filtros
  const resetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedStatus('PUBLISHED')
    fetchPosts(1, {})
  }

  // Buscar posts iniciais
  useEffect(() => {
    if (initialPosts.length === 0) {
      const filters: any = {}
      if (categoryId) filters.categoryId = categoryId
      if (authorId) filters.authorId = authorId
      fetchPosts(1, filters)
    }
  }, [categoryId, authorId, initialPosts.length])

  // Aplicar filtros quando mudarem
  useEffect(() => {
    if (initialPosts.length === 0 && layout !== 'sidebar') {
      applyFilters()
    }
  }, [searchTerm, selectedCategory, selectedStatus])

  const handlePageChange = (page: number) => {
    const filters: any = {}
    if (searchTerm) filters.search = searchTerm
    if (selectedCategory) filters.categoryId = selectedCategory
    if (selectedStatus) filters.status = selectedStatus
    if (authorId) filters.authorId = authorId

    fetchPosts(page, filters)
  }

  // Layout para sidebar - versão compacta
  if (layout === 'sidebar') {
    return (
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          posts.slice(0, limit).map((post) => (
            <div key={post.id} className="group">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <h4 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors text-sm line-clamp-2 mb-2">
                    {post.title}
                  </h4>
                  {post.excerpt && (
                    <p className="text-gray-600 text-xs line-clamp-2 mb-2">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(post.publishedAt || '').toLocaleDateString('pt-BR')}</span>
                    <span>{post._count.views} visualizações</span>
                  </div>
                </div>
              </Link>
            </div>
          ))
        )}
      </div>
    )
  }

  if (layout === 'featured') {
    return (
      <div className="space-y-8">
        {posts.length > 0 && (
          <div className="grid gap-8">
            <PostCard post={posts[0]} variant="featured" />
            <div className="grid md:grid-cols-2 gap-6">
              {posts.slice(1, 3).map((post) => (
                <PostCard key={post.id} post={post} variant="default" />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros e Busca */}
      {(showFilters || showSearch) && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            {showSearch && (
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
            )}

            {/* Filtros */}
            {showFilters && (
              <div className="flex gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="PUBLISHED">Publicados</option>
                  <option value="DRAFT">Rascunhos</option>
                  <option value="SCHEDULED">Agendados</option>
                </select>

                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Limpar
                </button>
              </div>
            )}

            {/* View Mode Toggle */}
            {layout === 'grid' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-pink-100 text-pink-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-pink-100 text-pink-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* Posts Grid/List */}
      {!loading && posts.length > 0 && (
        <div
          className={
            viewMode === 'grid'
              ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
              : 'space-y-6'
          }
        >
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              variant={viewMode === 'list' ? 'compact' : 'default'}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum post encontrado
          </h3>
          <p className="text-gray-600">
            Tente ajustar os filtros ou buscar por outros termos.
          </p>
        </div>
      )}

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1
            const isCurrent = page === currentPage
            const isNearCurrent = Math.abs(page - currentPage) <= 2

            if (isCurrent || isNearCurrent || page === 1 || page === totalPages) {
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    isCurrent
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              )
            } else if (page === currentPage - 3 || page === currentPage + 3) {
              return <span key={page} className="px-2">...</span>
            }
            return null
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
} 