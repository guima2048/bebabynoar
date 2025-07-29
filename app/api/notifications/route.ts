import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Buscar notificações do usuário
export async function GET(_request: NextRequest) {
  try {
    const userId = _request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(_request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Buscar notificações do usuário
    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    return NextResponse.json({
      notifications: notifications,
      total: notifications.length
    })

  } catch (error) {
    console.error('❌ Erro ao buscar notificações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova notificação
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId: targetUserId, title, message, type } = body

    if (!targetUserId || !title || !message || !type) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Criar notificação
    const notification = await prisma.notification.create({
      data: {
        userId: targetUserId,
        title: title,
        message: message,
        type: type
      }
    })

    console.log('✅ Notificação criada:', notification.id)

    return NextResponse.json({
      success: true,
      notification: notification
    })

  } catch (error) {
    console.error('❌ Erro ao criar notificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 