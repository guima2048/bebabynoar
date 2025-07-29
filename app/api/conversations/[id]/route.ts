import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = request.headers.get('x-user-id');
  const conversationId = params.id;

  if (!userId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  try {
    // Buscar conversa e verificar se o usuário participa
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: { userId: userId }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                photoURL: true,
                premium: true
              }
            }
          }
        }
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 });
    }

    // Encontrar o outro participante (não o usuário logado)
    const participant = conversation.participants.find(p => p.user.id !== userId);

    if (!participant) {
      return NextResponse.json({ error: 'Participante não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        participant: {
          id: participant.user.id,
          name: participant.user.username || participant.user.id,
          username: participant.user.username,
          photoURL: participant.user.photoURL,
          premium: participant.user.premium
        },
        updatedAt: conversation.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Erro ao buscar conversa:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 