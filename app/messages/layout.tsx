import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mensagens - Bebaby App',
  description: 'Converse com outros usuários do Bebaby App. Veja suas conversas, mensagens não lidas e usuários online.',
};

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 