import type { Metadata } from 'next'
import SidebarMenu from '../../../components/SidebarMenu';

export const metadata: Metadata = {
  title: 'Editar Perfil - Bebaby App',
  description: 'Edite suas informações pessoais no Bebaby App. Atualize fotos, dados e preferências.',
}

export default function EditProfileLayout({
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