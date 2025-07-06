import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const sendMessageSchema = z.object({
  receiverId: z.string(),
  content: z.string().min(1),
  type: z.enum(['TEXT', 'IMAGE']).default('TEXT'),
  imageURL: z.string().url().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { conversationId, receiverId, content, type = 'TEXT', imageURL } = body

    if (!conversationId || !receiverId || !content) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Verificar se o usuário é participante da conversa
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: conversationId,
        userId: session.user.id
      }
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Criar mensagem
    const message = await prisma.message.create({
      data: {
        content: content,
        type: type,
        imageURL: imageURL,
        conversationId: conversationId,
        senderId: session.user.id,
        receiverId: receiverId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            photoURL: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            username: true,
            photoURL: true
          }
        }
      }
    })

    // Atualizar última mensagem da conversa
    await prisma.conversation.update({
      where: {
        id: conversationId
      },
      data: {
        lastMessage: content,
        lastMessageTime: new Date()
      }
    })

    // Incrementar contador de mensagens não lidas para o receptor
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId: conversationId,
          userId: receiverId
        }
      },
      data: {
        unreadCount: {
          increment: 1
        }
      }
    })

    console.log('✅ Mensagem enviada:', message.id)

    return NextResponse.json({
      success: true,
      message: message
    })

  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'ID da conversa é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o usuário é participante da conversa
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: conversationId,
        userId: session.user.id
      }
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Buscar mensagens
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            photoURL: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            username: true,
            photoURL: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    // Marcar mensagens como lidas
    await prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        receiverId: session.user.id,
        read: false
      },
      data: {
        read: true
      }
    })

    // Atualizar contador de mensagens não lidas
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId: conversationId,
          userId: session.user.id
        }
      },
      data: {
        unreadCount: 0
      }
    })

    return NextResponse.json({
      messages: messages.reverse(), // Ordenar do mais antigo para o mais recente
      total: messages.length
    })

  } catch (error) {
    console.error('❌ Erro ao buscar mensagens:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 