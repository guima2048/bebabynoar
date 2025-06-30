'use client'

import React, { useState, useEffect } from 'react'
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

interface BlogSettings {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  titleColor: string
  titleFont: string
  bodyFont: string
  heroTitle: string
  heroSubtitle: string
  heroBackgroundImage: string
  heroBackgroundAlt: string
  siteTitle: string
  siteDescription: string
  defaultKeywords: string
  searchPlaceholder: string
  recentArticlesTitle: string
  popularArticlesTitle: string
  readMoreText: string
  noArticlesText: string
  footerText: string
  privacyPolicyText: string
  termsText: string
  contactText: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  h1FontSize: string
  h1Align: string
  h1LineHeight: string
  h2FontSize: string
  h2Align: string
  h2LineHeight: string
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
  } catch (error) {
    console.error('Erro ao buscar posts:', error)
    return []
  }
}

async function getBlogSettings(): Promise<BlogSettings> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://123124239.vercel.app'}/api/blog-settings`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.error('Erro ao buscar configurações:', response.status)
      return {
        primaryColor: '#D4AF37',
        secondaryColor: '#4A1E3A',
        accentColor: '#FFD700',
        backgroundColor: '#FAFAFA',
        textColor: '#2D3748',
        titleColor: '#D4AF37',
        titleFont: 'Playfair Display',
        bodyFont: 'Open Sans',
        heroTitle: 'Universo Sugar - O Melhor Site de Relacionamento Sugar',
        heroSubtitle: 'Descubra o mundo exclusivo dos relacionamentos sugar. Conecte-se com sugar daddies e sugar babies de qualidade.',
        heroBackgroundImage: '',
        heroBackgroundAlt: 'Universo Sugar - Site de relacionamento sugar',
        siteTitle: 'Universo Sugar - Site de Relacionamento Sugar | Sugar Daddy e Sugar Baby',
        siteDescription: 'O melhor site de relacionamento sugar do Brasil. Conecte-se com sugar daddies e sugar babies de qualidade. Patrocinador confiável para relacionamentos sugar.',
        defaultKeywords: 'Universo sugar, Patrocinador, Sugar baby, sugar daddy, site de relacionamento sugar',
        searchPlaceholder: 'Pesquise artigos sobre relacionamentos sugar...',
        recentArticlesTitle: 'Artigos Recentes',
        popularArticlesTitle: 'Artigos Populares',
        readMoreText: 'Ler Mais',
        noArticlesText: 'Nenhum artigo encontrado',
        footerText: '© 2024 Universo Sugar. Todos os direitos reservados.',
        privacyPolicyText: 'Política de Privacidade',
        termsText: 'Termos de Uso',
        contactText: 'Contato',
        metaTitle: 'Universo Sugar - O Melhor Site de Relacionamento Sugar',
        metaDescription: 'Conecte-se com sugar daddies e sugar babies de qualidade. Nosso site de relacionamento sugar oferece a melhor experiência.',
        metaKeywords: 'universo sugar, patrocinador, sugar baby, sugar daddy, site de relacionamento sugar',
        h1FontSize: '2.5rem',
        h1Align: 'center',
        h1LineHeight: '1.2',
        h2FontSize: '1.5rem',
        h2Align: 'center',
        h2LineHeight: '1.2',
      }
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return {
      primaryColor: '#D4AF37',
      secondaryColor: '#4A1E3A',
      accentColor: '#FFD700',
      backgroundColor: '#FAFAFA',
      textColor: '#2D3748',
      titleColor: '#D4AF37',
      titleFont: 'Playfair Display',
      bodyFont: 'Open Sans',
      heroTitle: 'Universo Sugar - O Melhor Site de Relacionamento Sugar',
      heroSubtitle: 'Descubra o mundo exclusivo dos relacionamentos sugar. Conecte-se com sugar daddies e sugar babies de qualidade.',
      heroBackgroundImage: '',
      heroBackgroundAlt: 'Universo Sugar - Site de relacionamento sugar',
      siteTitle: 'Universo Sugar - Site de Relacionamento Sugar | Sugar Daddy e Sugar Baby',
      siteDescription: 'O melhor site de relacionamento sugar do Brasil. Conecte-se com sugar daddies e sugar babies de qualidade. Patrocinador confiável para relacionamentos sugar.',
      defaultKeywords: 'Universo sugar, Patrocinador, Sugar baby, sugar daddy, site de relacionamento sugar',
      searchPlaceholder: 'Pesquise artigos sobre relacionamentos sugar...',
      recentArticlesTitle: 'Artigos Recentes',
      popularArticlesTitle: 'Artigos Populares',
      readMoreText: 'Ler Mais',
      noArticlesText: 'Nenhum artigo encontrado',
      footerText: '© 2024 Universo Sugar. Todos os direitos reservados.',
      privacyPolicyText: 'Política de Privacidade',
      termsText: 'Termos de Uso',
      contactText: 'Contato',
      metaTitle: 'Universo Sugar - O Melhor Site de Relacionamento Sugar',
      metaDescription: 'Conecte-se com sugar daddies e sugar babies de qualidade. Nosso site de relacionamento sugar oferece a melhor experiência.',
      metaKeywords: 'universo sugar, patrocinador, sugar baby, sugar daddy, site de relacionamento sugar',
      h1FontSize: '2.5rem',
      h1Align: 'center',
      h1LineHeight: '1.2',
      h2FontSize: '1.5rem',
      h2Align: 'center',
      h2LineHeight: '1.2',
    }
  }
}

function parseFirestoreDate(date: any): Date | null {
  if (!date) { return null; }
  if (typeof date === 'string' || typeof date === 'number') {
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof date === 'object' && 'seconds' in date) {
    return new Date(date.seconds * 1000);
  }
  return null;
}

function formatDate(date: any) {
  const d = parseFirestoreDate(date);
  if (!d) { return 'Data não definida'; }
  return format(d, 'dd/MM/yyyy', { locale: ptBR });
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [settings, setSettings] = useState<BlogSettings>({
    primaryColor: '#D4AF37',
    secondaryColor: '#4A1E3A',
    accentColor: '#FFD700',
    backgroundColor: '#FAFAFA',
    textColor: '#2D3748',
    titleColor: '#D4AF37',
    titleFont: 'Playfair Display',
    bodyFont: 'Inter',
    heroTitle: 'Bem-vindo ao Universo Sugar',
    heroSubtitle: 'Descubra relacionamentos extraordinários',
    heroBackgroundImage: '',
    heroBackgroundAlt: 'Hero background',
    siteTitle: 'Universo Sugar',
    siteDescription: 'Site de relacionamento sugar',
    recentArticlesTitle: 'Artigos Recentes',
    noArticlesText: 'Nenhum artigo encontrado',
    readMoreText: 'Ler mais',
    footerText: '© 2024 Universo Sugar. Todos os direitos reservados.',
    privacyPolicyText: 'Política de Privacidade',
    termsText: 'Termos de Uso',
    contactText: 'Contato',
    defaultKeywords: 'universo sugar, patrocinador, sugar baby, sugar daddy, site de relacionamento sugar',
    searchPlaceholder: 'Buscar artigos...',
    popularArticlesTitle: 'Artigos Populares',
    metaTitle: 'Universo Sugar - O Melhor Site de Relacionamento Sugar',
    metaDescription: 'Conecte-se com sugar daddies e sugar babies de qualidade. Nosso site de relacionamento sugar oferece a melhor experiência.',
    metaKeywords: 'universo sugar, patrocinador, sugar baby, sugar daddy, site de relacionamento sugar',
    h1FontSize: '2.5rem',
    h1Align: 'center',
    h1LineHeight: '1.2',
    h2FontSize: '1.5rem',
    h2Align: 'center',
    h2LineHeight: '1.2',
  })
  const [loading, setLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
    fetchPosts()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/blog-settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog')
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Erro ao carregar posts:', error)
    } finally {
      setPostsLoading(false)
    }
  }

  // Estilos dinâmicos baseados nas configurações
  const dynamicStyles = {
    '--primary-color': settings.primaryColor,
    '--secondary-color': settings.secondaryColor,
    '--background-color': settings.backgroundColor,
    '--text-color': settings.textColor,
    '--title-color': settings.titleColor,
    '--title-font': settings.titleFont,
    '--body-font': settings.bodyFont,
  } as React.CSSProperties;

  const h1Style = {
    fontSize: settings.h1FontSize,
    textAlign: settings.h1Align as any,
    lineHeight: settings.h1LineHeight,
    fontFamily: settings.titleFont,
    color: settings.titleColor
  };
  const h2Style = {
    fontSize: settings.h2FontSize,
    textAlign: settings.h2Align as any,
    lineHeight: settings.h2LineHeight,
    fontFamily: settings.titleFont,
    color: settings.titleColor
  };

  const now = new Date();
  const postsPublicados = posts.filter(post => {
    if (post.status !== 'published') return false;
    if (post.publishedAt) {
      const pubDate = parseFirestoreDate(post.publishedAt);
      if (!pubDate || pubDate > now) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: settings.backgroundColor }}>
      {/* Seções Configuráveis */}
      {/* Remover todo o bloco que faz uso de settings.sections.filter(...).map(...) */}
      {/* Manter apenas o layout do blog, hero, posts, etc, sem seções configuráveis. */}

      {/* Posts do Blog */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={h2Style}
            >
              Últimos Posts
            </h2>
            <p className="text-xl text-gray-600">
              Descubra insights e dicas sobre relacionamentos sugar
            </p>
          </div>

          {postsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando posts...</p>
            </div>
          ) : postsPublicados.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum post encontrado.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {postsPublicados.map((post: BlogPost) => {
                const data = parseFirestoreDate(post.createdAt);
                return (
                  <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    {post.featuredImage && (
                      <div className="relative h-48">
                        <Image
                          src={post.featuredImage}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          {data ? format(data, 'dd/MM/yyyy', { locale: ptBR }) : 'Data inválida'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          {data ? format(data, 'HH:mm', { locale: ptBR }) : '--:--'}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-3 line-clamp-2">{post.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold"
                      >
                        Ler mais
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
