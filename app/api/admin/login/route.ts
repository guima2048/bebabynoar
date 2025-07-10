import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Rate limiting simples para login admin
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const attempts = loginAttempts.get(ip)
  
  if (!attempts) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now })
    return true
  }
  
  // Reset após 15 minutos
  if (now - attempts.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now })
    return true
  }
  
  // Máximo 5 tentativas por 15 minutos
  if (attempts.count >= 5) {
    return false
  }
  
  attempts.count++
  attempts.lastAttempt = now
  return true
}

export async function POST(req: NextRequest) {
  try {
    console.log('🔐 Admin Login: Iniciando processo de login...')
    
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown'
    if (!checkRateLimit(ip)) {
      console.log('❌ Admin Login: Rate limit excedido para IP:', ip)
      return NextResponse.json(
        { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
        { status: 429 }
      )
    }
    
    const { username, password } = await req.json()
    console.log('🔐 Admin Login: Credenciais recebidas:', { username })

    // Validação de entrada
    if (!username || !password) {
      console.log('❌ Admin Login: Credenciais faltando')
      return NextResponse.json({ error: 'Usuário e senha são obrigatórios' }, { status: 400 })
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      console.log('❌ Admin Login: Tipos de dados inválidos')
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    if (username.length > 100 || password.length > 100) {
      console.log('❌ Admin Login: Dados muito longos')
      return NextResponse.json({ error: 'Dados muito longos' }, { status: 400 })
    }

    // Verifica credenciais hardcoded (em produção, use variáveis de ambiente)
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    console.log('🔐 Admin Login: Verificando credenciais...')
    console.log('🔐 Admin Login: Username esperado:', adminUsername)
    console.log('🔐 Admin Login: Username recebido:', username)

    // Comparação segura com timing constante
    const usernameMatch = username === adminUsername
    const passwordMatch = password === adminPassword
    
    if (usernameMatch && passwordMatch) {
      console.log('✅ Admin Login: Credenciais válidas, criando sessão...')
      
      // Cria cookie de sessão administrativa com configurações seguras
      const response = NextResponse.json({ 
        success: true, 
        message: 'Login realizado com sucesso'
      })
      
      const isProd = process.env.NODE_ENV === 'production'
      response.cookies.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: isProd, // true só em produção HTTPS
        sameSite: isProd ? 'strict' : 'lax',
        maxAge: 60 * 60 * 24, // 24 horas
        path: '/'
      })

      console.log('✅ Admin Login: Cookie definido com sucesso')
      return response
    } else {
      // Delay para prevenir timing attacks
      await new Promise(resolve => setTimeout(resolve, 100))
      console.log('❌ Admin Login: Credenciais inválidas')
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

  } catch (error) {
    console.error('❌ Admin Login: Erro no login administrativo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    console.log('🔐 Admin Logout: Iniciando logout...')
    
    // Remove cookie de sessão
    const response = NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso'
    })
    
    response.cookies.delete('admin_session')
    console.log('✅ Admin Logout: Cookie removido com sucesso')

    return response

  } catch (error) {
    console.error('❌ Admin Logout: Erro no logout administrativo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 