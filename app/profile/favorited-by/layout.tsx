import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quem me favoritou - Bebaby App',
  description: 'Veja a lista de perfis que te favoritaram no Bebaby App.',
};

export default function FavoritedByLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 