import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'

const resetPasswordSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = resetPasswordSchema.parse(body)

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

    // Gerar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hora

    // Salvar token no banco (você pode criar uma tabela separada para isso)
    // Por simplicidade, vou usar um campo no usuário
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // Você pode adicionar campos resetToken e resetTokenExpiry ao schema
        // Por enquanto, vou apenas simular
      }
    })

    // Enviar email (implementar com seu serviço de email)
    // await sendResetPasswordEmail(user.email, resetToken)

    return NextResponse.json(
      { message: 'Se o email existir, você receberá um link de recuperação' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro no reset de senha:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Email inválido' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 