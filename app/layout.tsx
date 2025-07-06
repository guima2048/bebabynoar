import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
})

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
        {/* Preconnect para domínios críticos */}
        <link rel="preconnect" href="https://firebase.googleapis.com" />
        <link rel="preconnect" href="https://firebaseinstallations.googleapis.com" />
        <link rel="preconnect" href="https://bebaby-56627.firebaseapp.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch para outros domínios */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://apis.google.com" />
        
        {/* Meta tags de performance */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 