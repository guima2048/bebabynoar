import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Usuário e senha são obrigatórios' }, { status: 400 })
    }

    // Verifica credenciais hardcoded (em produção, use variáveis de ambiente)
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    if (username === adminUsername && password === adminPassword) {
      // Cria cookie de sessão administrativa
      const cookieStore = cookies()
      cookieStore.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 horas
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Login realizado com sucesso'
      })
    } else {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

  } catch (error) {
    console.error('Erro no login administrativo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    // Remove cookie de sessão
    const cookieStore = cookies()
    cookieStore.delete('admin_session')

    return NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso'
    })

  } catch (error) {
    console.error('Erro no logout administrativo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 