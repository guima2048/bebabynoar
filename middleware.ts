import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt';

// Cache simples para rate limiting
const rateLimitCache = new Map<string, { count: number; resetTime: number }>()

// Configurações de rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 100 // 100 requests por minuto
const UPLOAD_RATE_LIMIT_MAX_REQUESTS = 10 // 10 uploads por minuto
const AUTH_RATE_LIMIT_MAX_REQUESTS = 100 // 100 tentativas de login por minuto (era 20)
const ADMIN_RATE_LIMIT_MAX_REQUESTS = 50 // 50 requests por minuto para admin

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  return forwarded?.split(',')[0] || realIP || cfConnectingIP || 'unknown'
}

function isRateLimited(ip: string, maxRequests: number): boolean {
  const now = Date.now()
  const record = rateLimitCache.get(ip)
  
  if (!record || now > record.resetTime) {
    rateLimitCache.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }
  
  if (record.count >= maxRequests) {
    return true
  }
  
  record.count++
  return false
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const clientIP = getClientIP(request)
  
  // Proteção de rotas autenticadas
  const protectedPaths = [
    '/profile',
    '/profile/',
    '/profile/edit',
    '/profile/favorites',
    '/profile/favorited-by',
    '/profile/requests',
    '/profile/who-viewed-me',
    '/messages',
    '/notifications',
    // adicione outras rotas protegidas aqui
  ];
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET! });
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Verificação de e-mail será implementada no lado do cliente
  // para evitar problemas com o Edge Runtime
  
  // Headers de segurança básicos
  const response = NextResponse.next()
  
  // Headers de segurança
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Rate limiting para APIs específicas
      if (pathname.startsWith('/api/upload-photo')) {
    if (isRateLimited(clientIP, UPLOAD_RATE_LIMIT_MAX_REQUESTS)) {
      return new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded. Too many upload requests.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  // Rate limiting específico para APIs do admin
  if (pathname.startsWith('/api/admin/')) {
    if (isRateLimited(clientIP, ADMIN_RATE_LIMIT_MAX_REQUESTS)) {
      return new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded for admin operations.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }
    return response
  }
  
  // Rate limiting para autenticação (exceto rotas de sessão do NextAuth)
  if (
    pathname.startsWith('/api/auth')
  ) {
    if (isRateLimited(clientIP, AUTH_RATE_LIMIT_MAX_REQUESTS)) {
      return new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded. Too many authentication attempts.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
  
  // Rate limiting geral para APIs (exceto admin)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/admin/')) {
    if (isRateLimited(clientIP, RATE_LIMIT_MAX_REQUESTS)) {
      return new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded. Too many requests.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 