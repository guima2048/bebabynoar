import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'

// Interface para as configurações do blog
interface BlogSettings {
  // Cores
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  
  // Fontes
  titleFont: string;
  bodyFont: string;
  
  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  heroBackgroundImage: string;
  heroBackgroundAlt: string;
  
  // SEO Global
  siteTitle: string;
  siteDescription: string;
  defaultKeywords: string;
  
  // Textos Estáticos
  searchPlaceholder: string;
  recentArticlesTitle: string;
  popularArticlesTitle: string;
  readMoreText: string;
  noArticlesText: string;
  
  // Footer
  footerText: string;
  privacyPolicyText: string;
  termsText: string;
  contactText: string;
  
  // Meta
  updatedAt: string;
}

// Configurações padrão
const defaultSettings: BlogSettings = {
  primaryColor: '#D4AF37', // Dourado
  secondaryColor: '#4A1E3A', // Roxo profundo
  accentColor: '#FFD700', // Amarelo
  backgroundColor: '#FAFAFA', // Branco cremoso
  textColor: '#2D3748', // Cinza escuro
  
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
  
  updatedAt: new Date().toISOString(),
};

export async function GET() {
  try {
    const settingsDoc = await prisma.blogSettings.findUnique({
      where: { id: 'main' },
    });
    
    if (settingsDoc) {
      return NextResponse.json(settingsDoc);
    } else {
      // Criar configurações padrão se não existirem
      await prisma.blogSettings.create({
        data: defaultSettings,
      });
      return NextResponse.json(defaultSettings);
    }
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json(defaultSettings);
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings: Partial<BlogSettings> = await request.json();
    
    // Adicionar timestamp de atualização
    settings.updatedAt = new Date().toISOString();
    
    await prisma.blogSettings.update({
      where: { id: 'main' },
      data: settings,
    });
    
    return NextResponse.json({ success: true, message: 'Configurações atualizadas com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    );
  }
} 