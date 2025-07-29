import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Responder a uma mensagem específica
export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { conversationId, receiverId, content, replyToMessageId } = body;

    if (!conversationId || !receiverId || !content || !replyToMessageId) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
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

    // Verificar se a mensagem que está sendo respondida existe
    const originalMessage = await prisma.message.findFirst({
      where: {
        id: replyToMessageId,
        conversationId: conversationId
      }
    });

    if (!originalMessage) {
      return NextResponse.json({ error: 'Mensagem original não encontrada' }, { status: 404 });
    }

    // Criar nova mensagem como resposta
    const message = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        receiverId,
        conversationId,
        read: false,
        replyToMessageId: replyToMessageId
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            photoURL: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            photoURL: true
          }
        },
        replyToMessage: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                username: true
              }
            }
          }
        }
      }
    });

    // Atualizar timestamp da conversa
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({
      message: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        read: message.read,
        replyToMessageId: message.replyToMessageId,
        replyToMessage: message.replyToMessage ? {
          id: message.replyToMessage.id,
          content: message.replyToMessage.content,
          senderName: message.replyToMessage.sender.username
        } : null,
        sender: {
          id: message.sender.id,
          name: message.sender.username || message.sender.id,
          username: message.sender.username,
          photoURL: message.sender.photoURL
        },
        receiver: {
          id: message.receiver.id,
          name: message.receiver.username || message.receiver.id,
          username: message.receiver.username,
          photoURL: message.receiver.photoURL
        }
      }
    });

  } catch (error) {
    console.error('Erro ao responder mensagem:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 