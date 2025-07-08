import React from 'react'
import Link from 'next/link'
// import { Metadata } from 'next'
// import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, ArrowLeft, Share2, Heart, MessageCircle } from 'lucide-react'
import Image from 'next/image'
// import { toast } from 'react-hot-toast'

interface BlogPost {
  id: string
  title: string
  content: string
  excerpt?: string
  slug: string
  imageURL?: string
  publishedAt?: string | Date | null
  tags: string[]
}

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// Adicionar um componente para exibir erros detalhados
function BlogError({ error }: { error: string }) {
  return (
    <div style={{ padding: 32, color: 'red', background: '#fff0f0', border: '1px solid #fbb' }}>
      <h2>Erro ao carregar o post do blog</h2>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{error}</pre>
      <p>Se você for admin, envie este erro para o desenvolvedor.</p>
    </div>
  )
}

async function getBlogPost(slug: string): Promise<BlogPost | null | { error: string }> {
  try {
    const post = await prisma.blogPost.findFirst({
      where: {
        slug,
        published: true,
      },
    })
    if (!post) {
      return { error: `[404] Nenhum post encontrado para o slug: ${slug}` }
    }
    return post as BlogPost
  } catch (err) {
    return { error: `[EXCEPTION] ${err instanceof Error ? err.message : String(err)}` }
  }
}

async function getRelatedPosts(currentPost: BlogPost): Promise<BlogPost[]> {
  try {
    const allPosts = await prisma.blogPost.findMany({
      where: {
        published: true,
        id: { not: currentPost.id },
      },
    })
    // Filtra posts relacionados por tags
    const relatedPosts = allPosts.filter(post => 
      post.tags && currentPost.tags && post.tags.some(tag => currentPost.tags.includes(tag))
    )
    return relatedPosts.slice(0, 3) as BlogPost[]
  } catch (err) {
    return []
  }
}

// Type guard para BlogPost
function isBlogPost(obj: any): obj is BlogPost {
  return obj && typeof obj === 'object' && 'title' in obj && 'slug' in obj && 'status' in obj;
}

function parseFirestoreDate(date: any): Date | null {
  if (!date) return null;
  if (typeof date === 'string' || typeof date === 'number') {
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof date === 'object') {
    if ('seconds' in date) return new Date(date.seconds * 1000);
    if ('_seconds' in date) return new Date(date._seconds * 1000);
    if (typeof date.toDate === 'function') return date.toDate();
  }
  return null;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const result = await getBlogPost(slug)
  if (!result) {
    return <BlogError error={"[ERRO] Nenhum resultado retornado de getBlogPost"} />
  }
  if (typeof result === 'object' && 'error' in result) {
    return <BlogError error={result.error} />
  }
  const post = result as BlogPost

  if (!post) {
    return <BlogError error="[ERRO] post está undefined ou null" />
  }
  if (!post.title) {
    return <BlogError error="[ERRO] post.title ausente" />
  }
  if (!post.content) {
    return <BlogError error="[ERRO] post.content ausente" />
  }
  if (!post.publishedAt) {
    return <BlogError error="[ERRO] post.publishedAt ausente" />
  }
  if (!Array.isArray(post.tags)) {
    post.tags = [];
  }

  const pubDate = parseFirestoreDate(post.publishedAt);
  console.log('[DEBUG] post.publishedAt:', post.publishedAt, '-> pubDate:', pubDate);
  const now = new Date();
  if (!pubDate) {
    return <BlogError error="[ERRO] pubDate é null ou inválido" />
  }
  if (isNaN(pubDate.getTime())) {
    return <BlogError error="[ERRO] pubDate.getTime() é NaN" />
  }
  if (pubDate > now) {
    return <BlogError error="[ERRO] pubDate está no futuro" />
  }

  const relatedPosts = await getRelatedPosts(post)

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link 
          href="/blog" 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Blog
        </Link>
      </nav>

      {/* Header do Post */}
      <article>
        <header className="mb-8">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map(tag => (
              <span 
                key={tag}
                className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Título */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta informações */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{pubDate ? format(pubDate, 'dd MMM yyyy', { locale: ptBR }) : 'Data inválida'}</span>
            </div>
          </div>

          {/* Imagem de destaque - Usando layout="fill" dentro de um container com altura fixa */}
          {post.imageURL && (
            <div className="mb-8 relative w-full h-64 md:h-96 rounded-xl overflow-hidden shadow-lg"> {/* Adicionado relative, w-full, h-xx, overflow-hidden */}
              <Image
                src={post.imageURL}
                alt={post.title}
                layout="fill" // Usar layout="fill" para preencher o contêiner pai
                objectFit="cover" // Garantir que a imagem cubra o espaço sem distorcer
                loading="lazy"
                placeholder="blur" // Usar placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" // Placeholder simples para blur
                unoptimized={post.imageURL.startsWith('http')}
                sizes="(max-width: 768px) 100vw, 1200px" // Manter sizes para srcset
              />
            </div>
          )}

          {/* Ações sociais */}
          <div className="flex items-center gap-4 mb-8">
            <button className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
              <Heart className="w-4 h-4" />
              Curtir
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Share2 className="w-4 h-4" />
              Compartilhar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <MessageCircle className="w-4 h-4" />
              Comentar
            </button>
          </div>
        </header>

        {/* Conteúdo */}
        <div className="prose prose-lg max-w-none mb-12">
          <div 
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Autor */}
        <div className="bg-gray-50 rounded-xl p-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {post.title.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
              <p className="text-gray-600">
                Especialista em relacionamentos e escritor do blog Bebaby
              </p>
            </div>
          </div>
        </div>
      </article>

      {/* Posts Relacionados */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Posts Relacionados</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {relatedPosts.map(relatedPost => (
              <article key={relatedPost.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-shadow">
                {relatedPost.imageURL && (
                  <Link href={`/blog/${relatedPost.slug}`} className="block relative w-full h-48 overflow-hidden"> {/* Adicionado relative, w-full, h-xx, overflow-hidden */}
                    <Image
                      src={relatedPost.imageURL}
                      alt={relatedPost.title}
                      layout="fill" // Usar layout="fill" para preencher o contêiner pai
                      objectFit="cover" // Garantir que a imagem cubra o espaço sem distorcer
                      loading="lazy"
                      placeholder="blur" // Usar placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAABAAAAAQABAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" // Placeholder simples para blur
                      unoptimized={relatedPost.imageURL.startsWith('http')}
                      sizes="(max-width: 768px) 100vw, 400px" // Manter sizes para srcset
                    />
                  </Link>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs text-gray-500">
                        {format(new Date(relatedPost.publishedAt ?? ''), 'dd MMM yyyy', { locale: ptBR })}
                      </span>
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                    <Link href={`/blog/${relatedPost.slug}`} className="hover:text-pink-600 transition-colors">
                      {relatedPost.title}
                    </Link>
                  </h3>
                  
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {relatedPost.excerpt}
                  </p>
                  
                  <Link 
                    href={`/blog/${relatedPost.slug}`}
                    className="text-pink-600 hover:text-pink-700 font-medium text-sm"
                  >
                    Ler mais →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 text-white text-center mt-12">
        <h2 className="text-2xl font-bold mb-4">Fique por dentro das novidades</h2>
        <p className="text-pink-100 mb-6 max-w-2xl mx-auto">
          Receba dicas exclusivas sobre relacionamentos, histórias inspiradoras e novidades do Bebaby App.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Seu melhor e-mail"
            className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button className="bg-white text-pink-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Inscrever
          </button>
        </div>
      </section>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const result = await getBlogPost(slug)
  if (!result || (typeof result === 'object' && 'error' in result)) {
    return {
      title: 'Post não encontrado - Blog Bebaby',
      description: 'O post solicitado não foi encontrado.',
    }
  }
  if (!isBlogPost(result)) {
    return {
      title: 'Post inválido - Blog Bebaby',
      description: 'Erro ao carregar post.',
    }
  }
  const post = result as BlogPost
  return {
    title: `${post.title} - Blog Bebaby`,
    description: post.excerpt,
    keywords: (post.tags || []).join(', '),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      images: post.imageURL ? [post.imageURL] : [],
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.title],
    },
  }
}
