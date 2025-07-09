import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SECURITY_CONFIG, logSecurityEvent } from '@/lib/security'

// Cache simples para rate limiting
const rateLimitCache = new Map<string, { count: number; resetTime: number }>()

// Configurações de rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 100 // 100 requests por minuto
const UPLOAD_RATE_LIMIT_MAX_REQUESTS = 10 // 10 uploads por minuto
const AUTH_RATE_LIMIT_MAX_REQUESTS = 5 // 5 tentativas de login por minuto

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const clientIP = getClientIP(request)
  
  // Headers de segurança
  const response = NextResponse.next()
  
  // Aplicar headers de segurança centralizados
  Object.entries(SECURITY_CONFIG.SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // Log de tentativas de acesso
  if (SECURITY_CONFIG.LOGGING.ENABLE_SECURITY_LOGS) {
    logSecurityEvent('Middleware Access', {
      path: pathname,
      method: request.method,
      ip: clientIP,
      userAgent: request.headers.get('user-agent')
    })
  }
  
  // Rate limiting para APIs específicas
  if (pathname.startsWith('/api/upload-photo') || pathname.startsWith('/api/upload-blog-image')) {
    if (isRateLimited(clientIP, UPLOAD_RATE_LIMIT_MAX_REQUESTS)) {
      return new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded. Too many upload requests.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
  
  // Rate limiting para autenticação (exceto rotas de sessão do NextAuth)
  if (
    pathname.startsWith('/api/auth') &&
    !pathname.startsWith('/api/auth/session') &&
    !pathname.startsWith('/api/auth/_log')
  ) {
    if (isRateLimited(clientIP, AUTH_RATE_LIMIT_MAX_REQUESTS)) {
      return new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded. Too many authentication attempts.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
  
  // Rate limiting geral para APIs
  if (pathname.startsWith('/api/')) {
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