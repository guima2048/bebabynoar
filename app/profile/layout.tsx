import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Meu Perfil - Bebaby App',
  description: 'Gerencie seu perfil no Bebaby App. Visualize e edite suas informações pessoais.',
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 