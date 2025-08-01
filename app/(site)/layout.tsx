import Link from 'next/link';
import { useEffect, useState } from 'react';

// Hook para saber se está no client
function useIsClient() {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => { setIsClient(true) }, [])
  return isClient
}

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Exemplo de uso do hook para imagens client-only:
  // const isClient = useIsClient();
  return (
    <>
      <nav className="flex gap-4">
        <Link href="/" className="text-gray-700 font-medium">Início</Link>
        <Link href="/explore" className="text-gray-700 font-medium">Explorar</Link>
        <Link href="/beneficios" className="text-pink-600 font-semibold">Benefícios</Link>
        <Link href="/register" className="bg-pink-600 text-white px-4 py-2 rounded-full font-semibold ml-2">Cadastre-se</Link>
      </nav>
      {/*
      Exemplo de uso seguro para imagens:
      {isClient && <img src="/landing/banner.png" alt="Banner" />}
      */}
      {children}
    </>
  )
} 