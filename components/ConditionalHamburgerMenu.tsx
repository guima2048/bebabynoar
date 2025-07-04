'use client'

import { usePathname } from 'next/navigation'
import HamburgerMenu from './HamburgerMenu'

export default function ConditionalHamburgerMenu() {
  const pathname = usePathname()
  
  // Páginas onde o menu hambúrguer NÃO deve aparecer
  const excludedPaths = [
    '/', // Landing page
    '/register', // Página de cadastro
    '/login', // Página de login
    '/blog', // Página do blog
  ]
  
  // Verificar se a rota atual é um post do blog (começa com /blog/ mas não é /blog)
  const isBlogPost = pathname.startsWith('/blog/') && pathname !== '/blog'
  
  // Verificar se deve mostrar o menu
  const shouldShowMenu = !excludedPaths.includes(pathname) && !isBlogPost
  
  // Se não deve mostrar o menu, retorna null
  if (!shouldShowMenu) {
    return null
  }
  
  // Se deve mostrar o menu, retorna o componente
  return <HamburgerMenu />
} 