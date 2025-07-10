import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCSRFToken, validateCSRFToken } from '@/lib/security'

export async function validateCSRFMiddleware(request: NextRequest): Promise<NextResponse | null> {
  // Apenas validar para métodos que modificam dados
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    return null
  }

  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')
    
    // Se não há sessão admin, não precisa validar CSRF
    if (!adminSession || adminSession.value !== 'authenticated') {
      return null
    }

    // Obter token CSRF do header
    const csrfToken = request.headers.get('X-CSRF-Token')
    
    if (!csrfToken) {
      return NextResponse.json(
        { error: 'Token CSRF não fornecido' },
        { status: 403 }
      )
    }

    // Obter token armazenado
    const storedToken = getCSRFToken(adminSession.value)
    
    if (!storedToken) {
      return NextResponse.json(
        { error: 'Token CSRF expirado ou inválido' },
        { status: 403 }
      )
    }

    // Validar token
    if (!validateCSRFToken(csrfToken, storedToken)) {
      return NextResponse.json(
        { error: 'Token CSRF inválido' },
        { status: 403 }
      )
    }

    return null // Token válido, continuar

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro na validação CSRF' },
      { status: 500 }
    )
  }
} 