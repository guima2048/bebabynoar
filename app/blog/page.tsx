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
  sections: Section[]
  metaTitle: string
  metaDescription: string
  metaKeywords: string
}

interface Section {
  id: string
  type: string
  title: string
  subtitle?: string
  content: string
  imageUrl?: string
  backgroundColor?: string
  textColor?: string
  layout?: string
  isActive: boolean
  order: number
  config?: {
    showTitle?: boolean
    showSubtitle?: boolean
    buttonText?: string
    buttonLink?: string
    layout?: string
    showImage?: boolean
  }
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
        sections: [],
        metaTitle: 'Universo Sugar - O Melhor Site de Relacionamento Sugar',
        metaDescription: 'Conecte-se com sugar daddies e sugar babies de qualidade. Nosso site de relacionamento sugar oferece a melhor experiência.',
        metaKeywords: 'universo sugar, patrocinador, sugar baby, sugar daddy, site de relacionamento sugar',
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
      sections: [],
      metaTitle: 'Universo Sugar - O Melhor Site de Relacionamento Sugar',
      metaDescription: 'Conecte-se com sugar daddies e sugar babies de qualidade. Nosso site de relacionamento sugar oferece a melhor experiência.',
      metaKeywords: 'universo sugar, patrocinador, sugar baby, sugar daddy, site de relacionamento sugar',
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
    sections: []
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: settings.backgroundColor }}>
      {/* Seções Configuráveis */}
      {settings.sections
        .filter(section => section.isActive)
        .sort((a, b) => a.order - b.order)
        .map((section) => (
          <div
            key={section.id}
            className="py-16 px-4"
            style={{ 
              backgroundColor: section.backgroundColor,
              color: section.textColor
            }}
          >
            <div className="max-w-6xl mx-auto">
              {section.type === 'hero' && (
                <div className="text-center">
                  {section.config?.showTitle && (
                    <h1 
                      className="text-4xl md:text-6xl font-bold mb-4"
                      style={{ fontFamily: settings.titleFont }}
                    >
                      {section.title}
                    </h1>
                  )}
                  {section.config?.showSubtitle && section.subtitle && (
                    <p className="text-xl md:text-2xl mb-8 opacity-90">
                      {section.subtitle}
                    </p>
                  )}
                  {section.content && (
                    <p className="text-lg mb-8 max-w-3xl mx-auto">
                      {section.content}
                    </p>
                  )}
                  {section.config?.buttonText && (
                    <Link
                      href={section.config.buttonLink || '#'}
                      className="inline-block bg-purple-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-purple-700 transition-colors"
                    >
                      {section.config.buttonText}
                    </Link>
                  )}
                </div>
              )}

              {section.type === 'about' && (
                <div className={`grid md:grid-cols-2 gap-12 items-center ${
                  section.config?.layout === 'right' ? 'md:grid-flow-col-dense' : ''
                }`}>
                  <div className={section.config?.layout === 'right' ? 'md:col-start-2' : ''}>
                    {section.config?.showTitle && (
                      <h2 
                        className="text-3xl md:text-4xl font-bold mb-4"
                        style={{ fontFamily: settings.titleFont }}
                      >
                        {section.title}
                      </h2>
                    )}
                    {section.config?.showSubtitle && section.subtitle && (
                      <p className="text-xl text-purple-600 mb-4">
                        {section.subtitle}
                      </p>
                    )}
                    <div className="text-lg leading-relaxed mb-6">
                      {section.content}
                    </div>
                    {section.config?.buttonText && (
                      <Link
                        href={section.config.buttonLink || '#'}
                        className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                      >
                        {section.config.buttonText}
                      </Link>
                    )}
                  </div>
                  {section.config?.showImage && section.imageUrl && (
                    <div className={section.config?.layout === 'right' ? 'md:col-start-1' : ''}>
                      <div className="relative h-96 rounded-lg overflow-hidden">
                        <Image
                          src={section.imageUrl}
                          alt={section.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {section.type === 'features' && (
                <div className="text-center">
                  {section.config?.showTitle && (
                    <h2 
                      className="text-3xl md:text-4xl font-bold mb-4"
                      style={{ fontFamily: settings.titleFont }}
                    >
                      {section.title}
                    </h2>
                  )}
                  {section.config?.showSubtitle && section.subtitle && (
                    <p className="text-xl text-purple-600 mb-8">
                      {section.subtitle}
                    </p>
                  )}
                  <div className="text-lg leading-relaxed mb-8 max-w-4xl mx-auto">
                    {section.content}
                  </div>
                  {section.config?.buttonText && (
                    <Link
                      href={section.config.buttonLink || '#'}
                      className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                    >
                      {section.config.buttonText}
                    </Link>
                  )}
                </div>
              )}

              {section.type === 'cta' && (
                <div className="text-center bg-purple-600 text-white rounded-2xl p-12">
                  {section.config?.showTitle && (
                    <h2 
                      className="text-3xl md:text-4xl font-bold mb-4"
                      style={{ fontFamily: settings.titleFont }}
                    >
                      {section.title}
                    </h2>
                  )}
                  {section.config?.showSubtitle && section.subtitle && (
                    <p className="text-xl mb-6 opacity-90">
                      {section.subtitle}
                    </p>
                  )}
                  <div className="text-lg mb-8 max-w-3xl mx-auto">
                    {section.content}
                  </div>
                  {section.config?.buttonText && (
                    <Link
                      href={section.config.buttonLink || '#'}
                      className="inline-block bg-white text-purple-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      {section.config.buttonText}
                    </Link>
                  )}
                </div>
              )}

              {section.type === 'newsletter' && (
                <div className="text-center bg-gray-100 rounded-2xl p-12">
                  {section.config?.showTitle && (
                    <h2 
                      className="text-3xl md:text-4xl font-bold mb-4"
                      style={{ fontFamily: settings.titleFont }}
                    >
                      {section.title}
                    </h2>
                  )}
                  {section.config?.showSubtitle && section.subtitle && (
                    <p className="text-xl text-gray-600 mb-6">
                      {section.subtitle}
                    </p>
                  )}
                  <div className="text-lg mb-8 max-w-3xl mx-auto">
                    {section.content}
                  </div>
                  <div className="max-w-md mx-auto">
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="Seu email"
                        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                        Inscrever
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {section.type === 'contact' && (
                <div className="text-center">
                  {section.config?.showTitle && (
                    <h2 
                      className="text-3xl md:text-4xl font-bold mb-4"
                      style={{ fontFamily: settings.titleFont }}
                    >
                      {section.title}
                    </h2>
                  )}
                  {section.config?.showSubtitle && section.subtitle && (
                    <p className="text-xl text-purple-600 mb-8">
                      {section.subtitle}
                    </p>
                  )}
                  <div className="text-lg leading-relaxed mb-8 max-w-4xl mx-auto">
                    {section.content}
                  </div>
                  <div className="grid md:grid-cols-3 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Email</h3>
                      <p>contato@universosugar.com</p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Suporte</h3>
                      <p>24/7 disponível</p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Localização</h3>
                      <p>Brasil</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

      {/* Posts do Blog */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: settings.titleFont }}
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
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum post encontrado.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  {post.coverImage && (
                    <div className="relative h-48">
                      <Image
                        src={post.coverImage}
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
                        {format(new Date(post.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        {format(new Date(post.createdAt), 'HH:mm', { locale: ptBR })}
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
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
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
