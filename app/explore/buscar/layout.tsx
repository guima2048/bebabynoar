import SidebarMenu from '../../../components/SidebarMenu';

export default function BuscarLayout({
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