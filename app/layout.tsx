import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import NotificationToast from '@/components/NotificationToast'
import HamburgerMenu from '../components/HamburgerMenu'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
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
      <body className={inter.className}>
        <AuthProvider>
          <NotificationProvider>
            <HamburgerMenu />
            <div className="min-h-screen flex flex-col">
              <main className="flex-1">
                {children}
              </main>
            </div>
            <NotificationToast />
            <Toaster position="top-right" />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 