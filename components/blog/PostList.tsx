'use client'

import { useState, useEffect } from 'react'
import PostCard from './PostCard'
import { Search, Filter, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react'

interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string
  featuredImage?: string
  publishedAt?: Date
  readTime?: number
  viewsCount: number
  likesCount: number
  author: {
    id: string
    name?: string
    username: string
    photoURL?: string
  }
  categories: Array<{
    id: string
    name: string
    slug: string
    color: string
  }>
  tags: string[]
}

interface PostListProps {
  initialPosts?: Post[]
  showFilters?: boolean
  showSearch?: boolean
  showPagination?: boolean
  layout?: 'grid' | 'list' | 'featured'
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(layout === 'featured' ? 'grid' : layout)
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

    if (showFilters) {
      fetchCategories()
    }
  }, [showFilters])

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

      if (data.success) {
        setPosts(data.posts)
        setTotalPages(data.pagination.totalPages)
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
    if (initialPosts.length === 0) {
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
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Limpar
                </button>
              </div>
            )}

            {/* Modo de visualização */}
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
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        </div>
      )}

      {/* Lista de Posts */}
      {!loading && posts.length > 0 && (
        <>
          <div className={
            viewMode === 'grid' 
              ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
          }>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                variant={viewMode === 'list' ? 'compact' : 'default'}
              />
            ))}
          </div>

          {/* Paginação */}
          {showPagination && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    currentPage === page
                      ? 'bg-pink-600 text-white border-pink-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Estado vazio */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum post encontrado
          </h3>
          <p className="text-gray-600">
            Tente ajustar os filtros ou fazer uma nova busca.
          </p>
        </div>
      )}
    </div>
  )
} 