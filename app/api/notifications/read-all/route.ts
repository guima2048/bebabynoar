import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_request: NextRequest) {
  try {
    const userId = _request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Marcar todas as notificações não lidas como lidas
    await prisma.notification.updateMany({
      where: {
        userId: userId,
        read: false
      },
      data: {
        read: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Todas as notificações foram marcadas como lidas'
    })

  } catch (error) {
    console.error('❌ Erro ao marcar todas as notificações como lidas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 