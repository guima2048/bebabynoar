import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Solicitações - Bebaby App',
  description: 'Gerencie as solicitações que você recebeu de outros usuários no Bebaby App.',
}

export default function RequestsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 