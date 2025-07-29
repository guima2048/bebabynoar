import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from './providers/session-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  metadataBase: new URL('https://bebaby.app'),
  title: 'Bebaby App - Conectando Sugar Babies e Sugar Daddies',
  description: 'Plataforma moderna e segura para relacionamentos sugar. Encontre sua conexão perfeita no Bebaby App.',
}

// Exemplo de hook client-only para layouts client:
// function useIsClient() {
//   const [isClient, setIsClient] = useState(false)
//   useEffect(() => { setIsClient(true) }, [])
//   return isClient
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Exemplo de uso do hook para imagens client-only:
  // const isClient = useIsClient();
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          {/*
          Exemplo de uso seguro para imagens:
          {isClient && <img src="/landing/banner.png" alt="Banner" />}
          */}
          {children}
        </AuthProvider>
      </body>
    </html>
  )
} 