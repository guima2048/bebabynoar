import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { userId, type, title, message, data } = await req.json()

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe
    const userDoc = await prisma.user.findUnique({
      where: { id: userId },
    })
    if (!userDoc) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Criar notificação
    const notificationData = {
      userId,
      type,
      title,
      message,
      data: data || {},
      read: false,
      createdAt: new Date()
    }

    const notificationRef = await prisma.notification.create({
      data: notificationData
    })

    return NextResponse.json({
      success: true,
      notificationId: notificationRef.id,
      message: 'Notificação criada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao criar notificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Marcar notificação como lida
export async function PUT(req: NextRequest) {
  try {
    const { notificationId, userId } = await req.json()

    if (!notificationId || !userId) {
      return NextResponse.json(
        { error: 'ID da notificação e usuário são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se a notificação existe e pertence ao usuário
    const notificationDoc = await prisma.notification.findUnique({
      where: { id: notificationId },
    })
    if (!notificationDoc) {
      return NextResponse.json(
        { error: 'Notificação não encontrada' },
        { status: 404 }
      )
    }

    if (notificationDoc.userId !== userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      )
    }

    // Marcar como lida
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        read: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Notificação marcada como lida'
    })

  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Marcar todas as notificações como lidas
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar todas as notificações não lidas do usuário
    const unreadNotifications = await prisma.notification.findMany({
      where: {
        userId: userId,
        read: false
      }
    })

    // Marcar todas como lidas
    const updatePromises = unreadNotifications.map(notification =>
      prisma.notification.update({
        where: { id: notification.id },
        data: {
          read: true
        }
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({
      success: true,
      message: `${unreadNotifications.length} notificações marcadas como lidas`
    })

  } catch (error) {
    console.error('Erro ao marcar notificações como lidas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

 