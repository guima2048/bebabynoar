import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    console.log('🔐 Admin Login: Iniciando processo de login...')
    const { username, password } = await req.json()
    console.log('🔐 Admin Login: Credenciais recebidas:', { username })

    if (!username || !password) {
      console.log('❌ Admin Login: Credenciais faltando')
      return NextResponse.json({ error: 'Usuário e senha são obrigatórios' }, { status: 400 })
    }

    // Verifica credenciais hardcoded (em produção, use variáveis de ambiente)
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    console.log('🔐 Admin Login: Verificando credenciais...')
    console.log('🔐 Admin Login: Username esperado:', adminUsername)
    console.log('🔐 Admin Login: Username recebido:', username)

    if (username === adminUsername && password === adminPassword) {
      console.log('✅ Admin Login: Credenciais válidas, criando sessão...')
      
      // Cria cookie de sessão administrativa
      const cookieStore = await cookies()
      cookieStore.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 horas
      })

      console.log('✅ Admin Login: Cookie definido com sucesso')

      return NextResponse.json({ 
        success: true, 
        message: 'Login realizado com sucesso'
      })
    } else {
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
    const cookieStore = await cookies()
    cookieStore.delete('admin_session')
    console.log('✅ Admin Logout: Cookie removido com sucesso')

    return NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso'
    })

  } catch (error) {
    console.error('❌ Admin Logout: Erro no logout administrativo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 