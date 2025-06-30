import React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react'
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
        contactText: 'Contato'
      }
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return {
      primaryColor: '#D4AF37',
      secondaryColor: '#4A1E3A',
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
      contactText: 'Contato'
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

export default async function BlogPage() {
  const [posts, settings] = await Promise.all([
    getBlogPosts(),
    getBlogSettings()
  ]);

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
    <div style={dynamicStyles} className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative h-96 flex items-center justify-center text-white"
        style={{
          backgroundImage: settings.heroBackgroundImage 
            ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${settings.heroBackgroundImage})`
            : `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="text-center max-w-4xl mx-auto px-4">
          <h1 
            className="text-4xl md:text-6xl font-bold mb-4"
            style={{ fontFamily: settings.titleFont }}
          >
            {settings.heroTitle}
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            {settings.heroSubtitle}
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={settings.searchPlaceholder}
              className="w-full pl-10 pr-4 py-3 rounded-full bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Artigos Recentes */}
        <section className="mb-16">
          <h2 
            className="text-3xl font-bold mb-8 text-center"
            style={{ color: settings.titleColor, fontFamily: settings.titleFont }}
          >
            {settings.recentArticlesTitle}
          </h2>
          
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">{settings.noArticlesText}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => {
                const publishedDate = parseFirestoreDate(post.publishedAt);
                const readTime = post.readTime || 5;
                
                return (
                  <article 
                    key={post.id} 
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                    style={{ fontFamily: settings.bodyFont }}
                  >
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
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{publishedDate ? format(publishedDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Data não definida'}</span>
                        <span className="mx-2">•</span>
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{readTime} min de leitura</span>
                      </div>
                      
                      <h3 
                        className="text-xl font-bold mb-3 line-clamp-2"
                        style={{ color: settings.titleColor, fontFamily: settings.titleFont }}
                      >
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      
                      <Link 
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center text-sm font-semibold hover:underline"
                        style={{ color: settings.primaryColor }}
                      >
                        {settings.readMoreText}
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Seção de Destaque */}
        <section className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 mb-16">
          <div className="text-center max-w-3xl mx-auto">
            <h2 
              className="text-3xl font-bold mb-4"
              style={{ color: settings.titleColor, fontFamily: settings.titleFont }}
            >
              Universo Sugar - O Melhor Site de Relacionamento Sugar
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Conecte-se com sugar daddies e sugar babies de qualidade. Nosso site de relacionamento sugar oferece a melhor experiência para encontrar seu patrocinador ideal.
            </p>
            <Link 
              href="/register"
              className="inline-flex items-center px-6 py-3 rounded-full font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: settings.primaryColor }}
            >
              Começar Agora
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 
                className="text-2xl font-bold mb-4"
                style={{ color: settings.primaryColor, fontFamily: settings.titleFont }}
              >
                Universo Sugar
              </h3>
              <p className="text-gray-300 mb-4">
                O melhor site de relacionamento sugar do Brasil. Conecte-se com sugar daddies e sugar babies de qualidade.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Links Úteis</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-300 hover:text-white">{settings.contactText}</Link></li>
                <li><Link href="/privacy" className="text-gray-300 hover:text-white">{settings.privacyPolicyText}</Link></li>
                <li><Link href="/terms" className="text-gray-300 hover:text-white">{settings.termsText}</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Palavras-chave</h4>
              <div className="text-sm text-gray-300">
                <p>Universo sugar</p>
                <p>Patrocinador</p>
                <p>Sugar baby</p>
                <p>Sugar daddy</p>
                <p>Site de relacionamento sugar</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">{settings.footerText}</p>
          </div>
        </div>
      </footer>
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
