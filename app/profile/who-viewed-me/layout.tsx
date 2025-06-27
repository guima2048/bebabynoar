import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quem Viu Meu Perfil - Bebaby App',
  description: 'Veja quem visitou seu perfil no Bebaby App. Recurso exclusivo para usuários Premium.',
}

export default function WhoViewedMeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 