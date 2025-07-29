import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Buscar mensagens de uma conversa
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');

  if (!userId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  if (!conversationId) {
    return NextResponse.json({ error: 'ID da conversa é obrigatório' }, { status: 400 });
  }

  try {
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

    // Buscar mensagens da conversa
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId
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
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Marcar mensagens como lidas
    await prisma.message.updateMany({
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
      messages: messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        createdAt: msg.createdAt.toISOString(),
        read: msg.read,
        replyToMessageId: msg.replyToMessageId,
        replyToMessage: msg.replyToMessage ? {
          id: msg.replyToMessage.id,
          content: msg.replyToMessage.content,
          senderName: msg.replyToMessage.sender.username
        } : null,
        sender: {
          id: msg.sender.id,
          name: msg.sender.username || msg.sender.id,
          username: msg.sender.username,
          photoURL: msg.sender.photoURL
        },
        receiver: {
          id: msg.receiver.id,
          name: msg.receiver.username || msg.receiver.id,
          username: msg.receiver.username,
          photoURL: msg.receiver.photoURL
        }
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Enviar nova mensagem
export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { conversationId, receiverId, content } = body;

    if (!conversationId || !receiverId || !content) {
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

    // Criar nova mensagem
    const message = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        receiverId,
        conversationId,
        read: false
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
    console.error('Erro ao enviar mensagem:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 