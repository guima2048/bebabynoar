import type { Metadata } from 'next'
import SidebarMenu from '../../../components/SidebarMenu';

export const metadata: Metadata = {
  title: 'Chat - Bebaby App',
  description: 'Converse em tempo real com outros usuários do Bebaby App.',
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SidebarMenu />
      {children}
    </>
  );
} 