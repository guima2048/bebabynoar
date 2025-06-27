import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Seja Premium - Bebaby App | Encontre Conexões Extraordinárias',
  description: 'Desbloqueie todo o potencial do Bebaby App com planos premium. Mensagens ilimitadas, perfis em destaque e muito mais.',
  keywords: 'premium, assinatura, relacionamentos sugar, mensagens ilimitadas, perfil destaque',
  openGraph: {
    title: 'Seja Premium - Bebaby App',
    description: 'Desbloqueie todo o potencial do Bebaby App com planos premium.',
    url: 'https://bebaby.app/premium',
    siteName: 'Bebaby App',
    type: 'website',
  },
}

export default function PremiumLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 