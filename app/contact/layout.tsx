import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contato - Bebaby App',
  description: 'Entre em contato com a equipe do Bebaby App. Suporte técnico, pagamentos, denúncias e parcerias.',
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 