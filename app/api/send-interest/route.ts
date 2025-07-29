import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const sendInterestSchema = z.object({
  receiverId: z.string(),
  message: z.string().optional(),
})

const respondInterestSchema = z.object({
  interestId: z.string(),
  response: z.enum(['ACCEPTED', 'REJECTED']),
  message: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { receiverId, message } = sendInterestSchema.parse(body)

    // Verificar se o receptor existe
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    })

    if (!receiver) {
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se já existe um interesse
    const existingInterest = await prisma.interest.findFirst({
      where: {
        senderId: userId,
        receiverId
      }
    })

    if (existingInterest) {
      return NextResponse.json(
        { message: 'Você já enviou interesse para este usuário' },
        { status: 400 }
      )
    }

    // Criar interesse
    const interest = await prisma.interest.create({
      data: {
        senderId: userId,
        receiverId,
        message: message ?? null,
        status: 'PENDING'
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            photoURL: true,
            userType: true,
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            photoURL: true,
            userType: true,
          }
        }
      }
    })

    // Criar notificação para o receptor
    await prisma.notification.create({
      data: {
        userId: receiverId,
        title: 'Novo interesse!',
        message: `${interest.sender.username} enviou interesse por você`,
        type: 'INTEREST',
      }
    })

    return NextResponse.json({
      message: 'Interesse enviado com sucesso',
      interest
    })
  } catch (error) {
    console.error('Erro ao enviar interesse:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Responder ao interesse
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { interestId, response, message } = respondInterestSchema.parse(body)

    // Buscar interesse
    const interest = await prisma.interest.findUnique({
      where: { id: interestId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            photoURL: true,
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            photoURL: true,
          }
        }
      }
    })

    if (!interest) {
      return NextResponse.json(
        { message: 'Interesse não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário atual é o receptor
    if (interest.receiverId !== userId) {
      return NextResponse.json(
        { message: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Atualizar interesse
    const updatedInterest = await prisma.interest.update({
      where: { id: interestId },
      data: {
        status: response,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            photoURL: true,
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            photoURL: true,
          }
        }
      }
    })

    // Criar notificação para o remetente
    const notificationTitle = response === 'ACCEPTED' 
      ? `${interest.receiver.username} aceitou seu interesse!` 
      : `${interest.receiver.username} não aceitou seu interesse`

    await prisma.notification.create({
      data: {
        userId: interest.senderId,
        title: notificationTitle,
        message: message ?? (response === 'ACCEPTED' ? 'Vocês podem começar a conversar!' : 'Não desanime, continue tentando!'),
        type: 'INTEREST',
      }
    })

    return NextResponse.json({
      message: response === 'ACCEPTED' ? 'Interesse aceito com sucesso' : 'Interesse rejeitado',
      interest: updatedInterest
    })
  } catch (error) {
    console.error('Erro ao responder interesse:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 