import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

export async function checkEmailVerification(request: NextRequest) {
  // Por enquanto, vamos fazer a verificação no lado do cliente
  // para evitar problemas com o Edge Runtime
  return null
}

export function shouldRedirectToVerification(pathname: string): boolean {
  // Páginas que não precisam de verificação de e-mail
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/verify-email',
    '/reset-password',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/cookies',
    '/safety',
    '/help',
    '/beneficios',
    '/sucesso',
    '/api/',
    '/_next/',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml'
  ]

  return !publicPaths.some(path => pathname.startsWith(path))
} 