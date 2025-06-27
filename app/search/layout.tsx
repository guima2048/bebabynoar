import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Busca Avançada - Bebaby App',
  description: 'Encontre pessoas perfeitas usando nossos filtros avançados no Bebaby App.',
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 