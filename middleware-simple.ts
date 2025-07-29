import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Headers de segurança básicos
  const response = NextResponse.next()
  
  // Headers de segurança essenciais
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Servir arquivos de upload em desenvolvimento
  if (process.env.NODE_ENV === 'development' && pathname.startsWith('/uploads/')) {
    try {
      const filePath = join(process.cwd(), 'public', pathname)
      
      if (existsSync(filePath)) {
        const fileBuffer = await readFile(filePath)
        const contentType = getContentType(pathname)
        
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000',
            'Access-Control-Allow-Origin': '*'
          },
        })
      }
    } catch (error) {
      console.error('Erro ao servir arquivo de upload:', error)
    }
  }
  
  // Proteção básica para rotas admin
  if (pathname.startsWith('/admin/') && !pathname.startsWith('/admin/login')) {
    // Verificar se está autenticado como admin
    const adminSession = request.cookies.get('admin_session')
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  
  return response
}

function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'gif':
      return 'image/gif'
    case 'webp':
      return 'image/webp'
    case 'svg':
      return 'image/svg+xml'
    default:
      return 'application/octet-stream'
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
} 