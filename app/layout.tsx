import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  metadataBase: new URL('https://bebaby.app'),
  title: 'Bebaby App - Conectando Sugar Babies e Sugar Daddies',
  description: 'Plataforma moderna e segura para relacionamentos sugar. Encontre sua conexão perfeita no Bebaby App.',
  keywords: 'sugar baby, sugar daddy, relacionamento, dating, app',
  authors: [{ name: 'Bebaby App' }],
  openGraph: {
    title: 'Bebaby App - Conectando Sugar Babies e Sugar Daddies',
    description: 'Plataforma moderna e segura para relacionamentos sugar.',
    url: 'https://bebaby.app',
    siteName: 'Bebaby App',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bebaby App - Conectando Sugar Babies e Sugar Daddies',
    description: 'Plataforma moderna e segura para relacionamentos sugar.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* CSS Crítico Inline - Estilos essenciais para renderização inicial */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* CSS Crítico - Carregamento imediato */
            html { font-family: 'Inter', system-ui, sans-serif; }
            body { 
              margin: 0; 
              padding: 0; 
              background-color: #f9fafb; 
              color: #111827; 
              font-family: 'Inter', sans-serif;
              line-height: 1.5;
            }
            /* Prevenção de CLS */
            * { box-sizing: border-box; }
            img { max-width: 100%; height: auto; }
            /* Loading state */
            .loading { opacity: 0; transition: opacity 0.3s ease; }
            .loaded { opacity: 1; }
            /* Font display swap para carregamento rápido */
            @font-face {
              font-family: 'Inter';
              src: url('/fonts/inter/Inter-Regular.woff2') format('woff2');
              font-weight: 400;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'Inter';
              src: url('/fonts/inter/Inter-Bold.woff2') format('woff2');
              font-weight: 700;
              font-style: normal;
              font-display: swap;
            }
          `
        }} />
        
        {/* Preconnect para domínios críticos */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch para outros domínios */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://apis.google.com" />
        
        {/* Preload de recursos críticos */}
        <link rel="preload" href="/fonts/inter/Inter-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/inter/Inter-Bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* Meta tags de performance */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* Resource hints para performance */}
        <link rel="prefetch" href="/_next/static/css/app/globals.css" as="style" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 