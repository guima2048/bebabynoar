import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authLimiter } from '@/lib/rate-limit'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown'
    const { success } = await authLimiter.check(5, ip) // 5 tentativas por 15 minutos
    
    if (!success) {
      return NextResponse.json(
        { message: 'Muitas tentativas. Tente novamente em 15 minutos.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email } = body

    // Validação de entrada
    if (!email || typeof email !== 'string' || email.length > 100) {
      return NextResponse.json(
        { message: 'Email inválido' },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (!user) {
      // Delay para prevenir timing attacks
      await new Promise(resolve => setTimeout(resolve, 100))
      return NextResponse.json(
        { message: 'Se o email existir, você receberá um link de recuperação' },
        { status: 200 }
      )
    }

    // Em produção, aqui você geraria um token único e enviaria por email
    // Por enquanto, apenas simula o processo
    console.log('Reset de senha solicitado para:', email)

    return NextResponse.json(
      { message: 'Se o email existir, você receberá um link de recuperação' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro no reset de senha:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown'
    const { success } = await authLimiter.check(5, ip) // 5 tentativas por 15 minutos
    
    if (!success) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
        { status: 429 }
      )
    }

    const { token, newPassword } = await request.json()

    // Validação de entrada
    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token e nova senha são obrigatórios' }, { status: 400 })
    }

    if (typeof token !== 'string' || typeof newPassword !== 'string') {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    if (token.length > 100 || newPassword.length > 100) {
      return NextResponse.json({ error: 'Dados muito longos' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres' }, { status: 400 })
    }

    // Reset de senha desativado: campo removido do banco
    return NextResponse.json({ error: 'Funcionalidade de reset de senha desativada temporariamente.' }, { status: 501 })

  } catch (error) {
    console.error('Erro ao resetar senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 