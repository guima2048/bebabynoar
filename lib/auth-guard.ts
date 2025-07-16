import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function checkEmailVerification(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return null // Usuário não está logado
    }

    // Buscar usuário no banco para verificar status do e-mail
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        emailVerified: true,
        emailVerificationToken: true,
        emailVerificationExpiry: true
      }
    })

    if (!user) {
      return null // Usuário não encontrado
    }

    // Verificar se o template de confirmação de e-mail está ativo
    const emailTemplate = await prisma.emailTemplate.findUnique({
      where: { slug: 'email-confirmation' },
      select: { enabled: true }
    })

    // Se o template estiver desabilitado, não exigir verificação
    if (!emailTemplate?.enabled) {
      return null
    }

    // Se o e-mail não está verificado, redirecionar para verificação
    if (!user.emailVerified) {
      return {
        requiresVerification: true,
        email: session.user.email,
        hasToken: !!user.emailVerificationToken,
        tokenExpired: user.emailVerificationExpiry ? user.emailVerificationExpiry < new Date() : false
      }
    }

    return null // E-mail verificado, pode acessar
  } catch (error) {
    console.error('Erro ao verificar verificação de e-mail:', error)
    return null // Em caso de erro, permitir acesso
  }
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