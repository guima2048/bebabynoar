import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, Eye, User, Calendar, Tag, Heart, MessageCircle, Share2, ArrowLeft, BookOpen } from 'lucide-react'
import LikeButton from '@/components/blog/LikeButton'
import CommentSection from '@/components/blog/CommentSection'
import PostList from '@/components/blog/PostList'
import Link from 'next/link'

interface PostPageProps {
  params: { slug: string }
}

async function getPost(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/blog/posts/${slug}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return data.success ? data.post : null
  } catch (error) {
    console.error('Erro ao buscar post:', error)
    return null
  }
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getPost(params.slug)
  
  if (!post) {
    return {
      title: 'Post não encontrado - Bebaby App',
    }
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    keywords: post.tags?.join(', '),
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      type: 'article',
      images: post.featuredImage ? [post.featuredImage] : [],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name || post.author.username],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  }
}

// Função utilitária para garantir que o src seja relativo
function getRelativeImageUrl(url: string) {
  if (!url) return '';
  
  // Se já é uma URL relativa (começa com /), retorna como está
  if (url.startsWith('/')) {
    return url;
  }
  
  // Se é uma URL completa, extrai o pathname
  if (url.startsWith('http')) {
    try {
      const u = new URL(url);
      return u.pathname;
    } catch {
      return url;
    }
  }
  
  // Se não tem / no início, adiciona
  if (!url.startsWith('/')) {
    return `/${url}`;
  }
  
  return url;
}

// Função para converter texto puro em HTML com parágrafos e quebras de linha
function formatContent(content: string) {
  if (!content) return '';
  // Divide por linhas duplas para parágrafos, linhas simples viram <br/>
  return content
    .split(/\n{2,}/g)
    .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br/>')}</p>`)
    .join('');
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: ptBR 
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50">
      {/* Botão de voltar (mobile only) */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md flex items-center px-4 py-3 md:hidden border-b border-gray-100 shadow-sm">
        <Link href="/blog" className="text-pink-600 font-semibold text-base flex items-center gap-2 hover:text-pink-700 transition-colors">
          <div suppressHydrationWarning>
            <ArrowLeft className="w-5 h-5" />
          </div>
          Voltar ao Blog
        </Link>
      </div>

      {/* Banner centralizado em formato 16:9 */}
      {post.featuredImage && (
        <div className="flex flex-col items-center mt-8 mb-4">
          <div className="relative w-full max-w-4xl aspect-[16/9] rounded-2xl overflow-hidden shadow-lg border-4 border-pink-100 bg-white flex items-center justify-center">
            <Image
              src={getRelativeImageUrl(post.featuredImage)}
              alt={post.featuredImageAlt || post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
          {/* Título do post */}
          <h1 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 text-center leading-tight">
            {post.title}
          </h1>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Mobile Title (hidden on desktop) */}
            {!post.featuredImage && (
              <div className="md:hidden mb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  {/* Categories */}
                  {post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.categories.map((category: any) => (
                        <span
                          key={category.id}
                          className="px-3 py-1 text-xs font-semibold rounded-full"
                          style={{ backgroundColor: category.color + '20', color: category.color }}
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Title */}
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    {post.title}
                  </h1>
                  
                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-base text-gray-600 mb-4">
                      {post.excerpt}
                    </p>
                  )}
                  
                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      {post.author.photoURL ? (
                        <Image
                          src={getRelativeImageUrl(post.author.photoURL)}
                          alt={post.author.name || post.author.username}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <div suppressHydrationWarning>
                          <User className="w-4 h-4" />
                        </div>
                      )}
                      <span className="font-medium text-gray-700">
                        {post.author.name || post.author.username}
                      </span>
                    </div>
                    {post.publishedAt && (
                      <div className="flex items-center gap-2">
                        <div suppressHydrationWarning>
                          <Calendar className="w-4 h-4" />
                        </div>
                        <span>{formatDate(post.publishedAt)}</span>
                      </div>
                    )}
                    {post.readTime && (
                      <div className="flex items-center gap-2">
                        <div suppressHydrationWarning>
                          <Clock className="w-4 h-4" />
                        </div>
                        <span>{post.readTime} min</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div suppressHydrationWarning>
                        <Eye className="w-4 h-4" />
                      </div>
                      <span>{post.viewsCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Article Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Article Header (desktop) */}
              {post.featuredImage && (
                <div className="hidden md:block p-8 pb-0">
                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                      <div suppressHydrationWarning>
                        <Tag className="w-4 h-4 text-gray-400" />
                      </div>
                      {post.tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Like Button */}
                  <div className="flex items-center justify-between mb-6">
                    <LikeButton postId={post.id} initialLikesCount={post.likesCount} />
                    <button className="flex items-center gap-2 text-gray-500 hover:text-pink-600 transition-colors">
                      <div suppressHydrationWarning>
                        <Share2 className="w-4 h-4" />
                      </div>
                      <span className="text-sm">Compartilhar</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Article Body */}
              <div className="p-6 md:p-8">
                {/* Mobile Tags and Like Button */}
                {post.featuredImage && (
                  <div className="md:hidden mb-6">
                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <div suppressHydrationWarning>
                          <Tag className="w-4 h-4 text-gray-400" />
                        </div>
                        {post.tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Like Button */}
                    <div className="flex items-center justify-between">
                      <LikeButton postId={post.id} initialLikesCount={post.likesCount} />
                      <button className="flex items-center gap-2 text-gray-500 hover:text-pink-600 transition-colors">
                        <div suppressHydrationWarning>
                          <Share2 className="w-4 h-4" />
                        </div>
                        <span className="text-sm">Compartilhar</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Article Content */}
                <article className="prose prose-lg prose-pink max-w-none">
                  <div
                    className="text-gray-800 leading-relaxed text-base sm:text-lg"
                    dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
                  />
                </article>

                {/* Article Footer */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span>Publicado {formatDate(post.publishedAt)}</span>
                      <span>•</span>
                      <span>{post.viewsCount} visualizações</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-2 hover:text-pink-600 transition-colors">
                        <div suppressHydrationWarning>
                          <Heart className="w-4 h-4" />
                        </div>
                        <span>Curtir</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-pink-600 transition-colors">
                        <div suppressHydrationWarning>
                          <MessageCircle className="w-4 h-4" />
                        </div>
                        <span>Comentar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-8">
              <CommentSection postId={post.id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Related Posts */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div suppressHydrationWarning>
                    <BookOpen className="w-5 h-5 text-pink-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Posts Relacionados</h3>
                </div>
                <PostList limit={3} layout="sidebar" showFilters={false} showSearch={false} showPagination={false} />
              </div>
              {/* Newsletter Signup */}
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-bold mb-2">Fique por dentro!</h3>
                <p className="text-pink-100 text-sm mb-4">
                  Receba as melhores dicas e histórias diretamente no seu email.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Seu email"
                    className="w-full px-3 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button className="w-full bg-white text-pink-600 py-2 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    Inscrever-se
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 