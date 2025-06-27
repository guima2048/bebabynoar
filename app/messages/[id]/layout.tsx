import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chat - Bebaby App',
  description: 'Converse em tempo real com outros usuários do Bebaby App.',
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 