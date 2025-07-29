import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explorar - Bebaby App',
  description: 'Descubra novos usuários e faça conexões no Bebaby App.',
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 