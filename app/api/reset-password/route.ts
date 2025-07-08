import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Por segurança, não revelar se o email existe ou não
      return NextResponse.json(
        { message: 'Se o email existir, você receberá um link de recuperação' },
        { status: 200 }
      )
    }

    // Simulação: não gera token nem salva nada

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
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token e nova senha são obrigatórios' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres' }, { status: 400 })
    }

    // Buscar usuário pelo token de reset
    const user = await prisma.user.findFirst({
      where: { 
        passwordResetToken: token,
        passwordResetTokenExpiry: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 400 })
    }

    // Atualizar senha (em produção, deve ser criptografada)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: newPassword, // Em produção, usar bcrypt ou similar
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
        passwordUpdatedAt: new Date(),
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Senha atualizada com sucesso' 
    })

  } catch (error) {
    console.error('Erro ao resetar senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 