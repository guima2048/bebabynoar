import React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import Image from 'next/image'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  slug: string
  featuredImage?: string
  publishedAt: any
  scheduledFor?: any
  createdAt: any
  readTime: number
  author: string
  status: string
}

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://123124239.vercel.app'}/api/blog?status=published`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.error('Erro na API:', response.status)
      return []
    }
    
    const posts = await response.json()
    console.log('Posts recebidos:', posts.length)
    return posts
  } catch (err) {
    console.error('Erro ao carregar posts:', err)
    return []
  }
}

function parseFirestoreDate(date: any): Date {
  if (!date) {
    return new Date(0);
  }
  if (typeof date === 'string' || typeof date === 'number') {
    return new Date(date);
  }
  if (typeof date === 'object' && 'seconds' in date) {
    return new Date(date.seconds * 1000);
  }
  return new Date(0);
}

function getPostDate(post: BlogPost): string {
  if (post.status === 'scheduled' && post.scheduledFor) {
    return `Agendado para ${format(parseFirestoreDate(post.scheduledFor), 'dd MMM yyyy HH:mm', { locale: ptBR })}`;
  }
  if (post.publishedAt) {
    return format(parseFirestoreDate(post.publishedAt), 'dd MMM yyyy', { locale: ptBR });
  }
  return format(parseFirestoreDate(post.createdAt), 'dd MMM yyyy', { locale: ptBR });
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-secondary-900 mb-4">Blog Bebaby</h1>
        <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
          Dicas, histórias e insights sobre relacionamentos sugar. 
          Conecte-se com nossa comunidade através de conteúdo exclusivo.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-secondary-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-secondary-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Nenhum post ainda</h3>
          <p className="text-secondary-600">
            Em breve teremos conteúdo incrível para você!
          </p>
        </div>
      ) : (
        <div className="grid gap-8">
          {posts.map(post => (
            <article key={post.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row gap-6">
                {post.featuredImage && (
                  <div className="lg:w-1/3">
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      width={400}
                      height={192}
                      className="w-full h-48 lg:h-32 object-cover rounded-lg"
                      loading="lazy"
                      placeholder="empty"
                      unoptimized={post.featuredImage.startsWith('http')}
                      sizes="(max-width: 1024px) 100vw, 400px"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-4 text-sm text-secondary-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {getPostDate(post)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.readTime || 3} min de leitura
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-secondary-900 mb-3 hover:text-primary-600 transition-colors">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>
                  
                  <p className="text-secondary-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-secondary-500">
                      Por {post.author || 'Admin'}
                    </span>
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Ler mais
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export const metadata = {
  title: 'Blog Bebaby - Dicas e Histórias sobre Relacionamentos Sugar',
  description: 'Conecte-se com nossa comunidade através de conteúdo exclusivo sobre relacionamentos sugar. Dicas, histórias e insights.',
  keywords: 'blog, relacionamentos sugar, dicas, histórias, comunidade',
  openGraph: {
    title: 'Blog Bebaby - Dicas e Histórias sobre Relacionamentos Sugar',
    description: 'Conecte-se com nossa comunidade através de conteúdo exclusivo sobre relacionamentos sugar.',
    url: 'https://bebaby.app/blog',
    siteName: 'Bebaby App',
    type: 'website',
  },
}
