import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Meus favoritos - Bebaby App',
  description: 'Veja a lista de perfis que você favoritou no Bebaby App.',
};

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 