import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Marcar mensagens como lidas
export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { conversationId } = body;

    if (!conversationId) {
      return NextResponse.json({ error: 'ID da conversa é obrigatório' }, { status: 400 });
    }

    // Verificar se o usuário participa da conversa
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        users: {
          some: { id: userId }
        }
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 });
    }

    // Marcar todas as mensagens não lidas da conversa como lidas
    const updatedMessages = await prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        receiverId: userId,
        read: false
      },
      data: {
        read: true
      }
    });

    return NextResponse.json({
      message: 'Mensagens marcadas como lidas',
      updatedCount: updatedMessages.count
    });

  } catch (error) {
    console.error('Erro ao marcar mensagens como lidas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 