'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, User, Eye } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  featuredImage?: string
  publishedAt: string
  author: {
    name: string
    username: string
  }
  categories: Array<{
    category: {
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

export default function BlogPostList() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog/posts?limit=9')
      const data = await response.json()

      if (response.ok) {
        console.log('Posts carregados:', data.posts)
        setPosts(data.posts)
      } else {
        setError('Erro ao carregar posts')
      }
    } catch (error) {
      console.error('Erro ao buscar posts:', error)
      setError('Erro ao carregar posts')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchPosts}
          className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Nenhum post encontrado
        </h3>
        <p className="text-gray-600">
          Em breve teremos conteúdo incrível para você!
        </p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <article key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          {/* Image */}
          <div className="h-48 overflow-hidden">
            {post.featuredImage ? (
              <Image
                src={post.featuredImage.startsWith('/') ? post.featuredImage : `/${post.featuredImage}`}
                alt={post.title}
                width={400}
                height={200}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onError={() => {
                  console.error('Erro ao carregar imagem:', post.featuredImage)
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                <div className="text-4xl">
                  {post.categories[0]?.category.name === 'Dicas' && '💡'}
                  {post.categories[0]?.category.name === 'Finanças' && '💰'}
                  {post.categories[0]?.category.name === 'Viagens' && '✈️'}
                  {!post.categories[0] && '📝'}
                </div>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="p-6">
            {/* Category */}
            {post.categories.length > 0 && (
              <span className="inline-block px-3 py-1 text-xs font-semibold text-pink-600 bg-pink-100 rounded-full mb-3">
                {post.categories[0].category.name}
              </span>
            )}
            
            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
              {post.title}
            </h3>
            
            {/* Excerpt */}
            <p className="text-gray-600 mb-4 line-clamp-3">
              {post.excerpt}
            </p>
            
            {/* Meta */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{post.author.name || post.author.username}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>{post._count.views}</span>
              </div>
            </div>
            
            {/* Date */}
            <div className="flex items-center text-xs text-gray-400 mb-4">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
            </div>
            
            {/* Read More Button */}
            <Link
              href={`/blog/${post.slug}`}
              className="block w-full bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors duration-200 text-center"
            >
              Ler Mais
            </Link>
          </div>
        </article>
      ))}
    </div>
  )
} 