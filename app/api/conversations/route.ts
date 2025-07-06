import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Buscar conversas do usuário
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
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Buscar conversas do usuário
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                photoURL: true,
                verified: true,
                premium: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
                photoURL: true
              }
            }
          }
        }
      },
      orderBy: {
        lastMessageTime: 'desc'
      },
      take: limit,
      skip: offset
    })

    // Formatar dados para o frontend
    const formattedConversations = conversations.map(conversation => {
      const otherParticipant = conversation.participants.find(
        p => p.userId !== session.user.id
      )?.user

      const lastMessage = conversation.messages[0]
      const unreadCount = conversation.participants.find(
        p => p.userId === session.user.id
      )?.unreadCount || 0

      return {
        id: conversation.id,
        lastMessage: conversation.lastMessage,
        lastMessageTime: conversation.lastMessageTime,
        unreadCount: unreadCount,
        participant: otherParticipant,
        lastMessageSender: lastMessage?.sender
      }
    })

    return NextResponse.json({
      conversations: formattedConversations,
      total: formattedConversations.length
    })

  } catch (error) {
    console.error('❌ Erro ao buscar conversas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova conversa
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
    const { receiverId } = body

    if (!receiverId) {
      return NextResponse.json(
        { error: 'ID do receptor é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o receptor existe
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    })

    if (!receiver) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se já existe uma conversa entre os usuários
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            userId: {
              in: [session.user.id, receiverId]
            }
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                photoURL: true,
                verified: true,
                premium: true
              }
            }
          }
        }
      }
    })

    if (existingConversation) {
      return NextResponse.json({
        success: true,
        conversation: existingConversation,
        message: 'Conversa já existe'
      })
    }

    // Criar nova conversa
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: session.user.id },
            { userId: receiverId }
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                photoURL: true,
                verified: true,
                premium: true
              }
            }
          }
        }
      }
    })

    console.log('✅ Conversa criada:', conversation.id)

    return NextResponse.json({
      success: true,
      conversation: conversation
    })

  } catch (error) {
    console.error('❌ Erro ao criar conversa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 