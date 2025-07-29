'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Heart, Eye, MessageCircle, Clock, User, Image as ImageIcon } from 'lucide-react'

interface PostCardProps {
  post: {
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
  showAuthor?: boolean
  showCategories?: boolean
  showTags?: boolean
  variant?: 'default' | 'featured' | 'compact'
}

export default function PostCard({ 
  post, 
  showAuthor = true, 
  showCategories = true, 
  showTags = false,
  variant = 'default' 
}: PostCardProps) {
  const [imageError, setImageError] = useState(false)

  // Função para processar URL da imagem em desenvolvimento
  const getImageUrl = (url: string) => {
    if (process.env.NODE_ENV === 'development' && url.startsWith('/uploads/')) {
      return `/api/uploads${url}`
    }
    return url
  }

  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: ptBR 
    })
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // Usar a função getImageUrl para processar a URL
  const processedImageUrl = post.featuredImage ? getImageUrl(post.featuredImage) : null;

  // Componente de fallback para imagem
  const ImageFallback = ({ className = "" }: { className?: string }) => (
    <div className={`bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center ${className}`}>
      <div className="text-center">
        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-xs text-gray-500">Imagem não disponível</p>
      </div>
    </div>
  )

  if (variant === 'compact') {
    return (
      <Link href={`/blog/${post.slug}`} className="group">
        <article className="flex gap-4 p-4 rounded-lg border border-gray-200 hover:border-pink-300 transition-all duration-200 hover:shadow-md">
          {processedImageUrl && !imageError ? (
            <div className="relative w-20 h-20 flex-shrink-0">
              <Image
                src={processedImageUrl}
                alt={post.title}
                fill
                className="object-cover rounded-md"
                onError={(e) => {
                  console.error('❌ [PostCard] Erro ao carregar imagem compacta:', processedImageUrl, e)
                  setImageError(true)
                }}
                onLoad={() => {
                  console.log('✅ [PostCard] Imagem compacta carregada com sucesso:', processedImageUrl)
                }}
              />
            </div>
          ) : (
            <div className="w-20 h-20 flex-shrink-0">
              <ImageFallback className="w-full h-full rounded-md" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-2">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {truncateText(post.excerpt, 100)}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              {/* post.readTime is removed from interface, so this block will be removed */}
              <span className="flex items-center gap-1">
                <div suppressHydrationWarning>
                  <Eye className="w-3 h-3" />
                </div>
                {post._count.views}
              </span>
              <span className="flex items-center gap-1">
                <div suppressHydrationWarning>
                  <Heart className="w-3 h-3" />
                </div>
                {post._count.likes}
              </span>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  if (variant === 'featured') {
    return (
      <Link href={`/blog/${post.slug}`} className="group">
        <article className="relative overflow-hidden rounded-xl border border-gray-200 hover:border-pink-300 transition-all duration-200 hover:shadow-lg">
          {processedImageUrl && !imageError ? (
            <div className="relative h-64 w-full">
              <Image
                src={processedImageUrl}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  console.error('❌ [PostCard] Erro ao carregar imagem featured:', processedImageUrl, e)
                  setImageError(true)
                }}
                onLoad={() => {
                  console.log('✅ [PostCard] Imagem featured carregada com sucesso:', processedImageUrl)
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          ) : (
            <div className="relative h-64 w-full">
              <ImageFallback className="w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            {showCategories && post.categories.length > 0 && (
              <div className="flex gap-2 mb-3">
                                  {post.categories.slice(0, 2).map((category) => (
                    <span
                      key={category.category.id}
                      className="px-2 py-1 text-xs font-medium rounded-full bg-pink-100 text-pink-800"
                    >
                      {category.category.name}
                    </span>
                  ))}
              </div>
            )}
            <h2 className="text-xl font-bold mb-2 group-hover:text-pink-300 transition-colors">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-sm text-gray-200 mb-3 line-clamp-2">
                {truncateText(post.excerpt, 150)}
              </p>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {showAuthor && (
                  <div className="flex items-center gap-2">
                    {post.author.photoURL ? (
                      <Image
                        src={post.author.photoURL}
                        alt={post.author.name || post.author.username}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <div suppressHydrationWarning>
                        <User className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                    <span className="text-sm font-medium">
                      {post.author.name || post.author.username}
                    </span>
                  </div>
                )}
                {post.publishedAt && (
                  <span className="text-xs text-gray-300">
                    {formatDate(post.publishedAt)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm">
                {/* post.readTime is removed from interface, so this block will be removed */}
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {post._count.views}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {post._count.likes}
                </span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  // Variant default
  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <article className="bg-white rounded-xl border border-gray-200 hover:border-pink-300 transition-all duration-200 hover:shadow-lg overflow-hidden">
        {processedImageUrl && !imageError ? (
          <div className="relative h-48 w-full">
            <Image
              src={processedImageUrl}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                console.error('❌ [PostCard] Erro ao carregar imagem default:', processedImageUrl, e)
                setImageError(true)
              }}
              onLoad={() => {
                console.log('✅ [PostCard] Imagem default carregada com sucesso:', processedImageUrl)
              }}
            />
          </div>
        ) : (
          <div className="relative h-48 w-full">
            <ImageFallback className="w-full h-full" />
          </div>
        )}
        <div className="p-6">
          {showCategories && post.categories.length > 0 && (
            <div className="flex gap-2 mb-3">
                              {post.categories.slice(0, 3).map((category) => (
                  <span
                    key={category.category.id}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-pink-100 text-pink-800"
                  >
                    {category.category.name}
                  </span>
                ))}
            </div>
          )}
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-pink-600 transition-colors mb-2 line-clamp-2">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {truncateText(post.excerpt, 120)}
            </p>
          )}
          {/* Tags removed from interface */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showAuthor && (
                <div className="flex items-center gap-2">
                  {post.author.photoURL ? (
                    <Image
                      src={post.author.photoURL}
                      alt={post.author.name || post.author.username}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {post.author.name || post.author.username}
                  </span>
                </div>
              )}
              {post.publishedAt && (
                <span className="text-xs text-gray-500">
                  {formatDate(post.publishedAt)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              {/* post.readTime is removed from interface, so this block will be removed */}
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {post._count.views}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {post._count.likes}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {post._count.comments} {/* Placeholder para comentários */}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
} 