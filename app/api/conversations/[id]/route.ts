import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const conversationId = params.id

    // Buscar conversa
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId
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

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversa não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o usuário é participante da conversa
    const isParticipant = conversation.participants.some(
      p => p.userId === session.user.id
    )

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Encontrar o outro participante
    const otherParticipant = conversation.participants.find(
      p => p.userId !== session.user.id
    )

    if (!otherParticipant) {
      return NextResponse.json(
        { error: 'Participante não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        lastMessage: conversation.lastMessage,
        lastMessageTime: conversation.lastMessageTime,
        participant: otherParticipant.user
      }
    })

  } catch (error) {
    console.error('❌ Erro ao buscar conversa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 