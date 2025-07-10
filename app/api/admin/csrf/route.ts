import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { generateCSRFToken, storeCSRFToken } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    // Tentar obter o cookie de sessão admin
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')

    // Gerar token CSRF
    const csrfToken = generateCSRFToken()

    // Usar sessionId: se autenticado, usa o valor do cookie; se não, usa IP ou identificador anônimo
    let sessionId = ''
    if (adminSession && adminSession.value) {
      sessionId = adminSession.value
    } else {
      // Tenta usar IP, se não, gera um identificador aleatório
      sessionId = request.headers.get('x-forwarded-for') || 'anon-' + Math.random().toString(36).slice(2)
    }
    storeCSRFToken(sessionId, csrfToken)

    return NextResponse.json({
      csrfToken,
      expiresIn: 3600 // 1 hora em segundos
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 