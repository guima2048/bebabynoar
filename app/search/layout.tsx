import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Busca Avançada - Bebaby App',
  description: 'Encontre perfis com filtros detalhados no Bebaby App.',
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 