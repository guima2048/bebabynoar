import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quem viu meu perfil - Bebaby App',
  description: 'Veja quem visualizou seu perfil no Bebaby App. Descubra quem está interessado em você!',
};

export default function WhoViewedMeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 