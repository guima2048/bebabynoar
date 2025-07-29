import type { Metadata } from 'next'
import SidebarMenuWrapper from '../../components/SidebarMenuWrapper';
import { User, MessageCircle, Bell, LogOut, Eye, Users, Heart, Star, Compass, Search, Settings, Crown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Meu Perfil - Bebaby App',
  description: 'Gerencie seu perfil no Bebaby App. Visualize e edite suas informações pessoais.',
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SidebarMenuWrapper />
      {children}
    </>
  );
} 