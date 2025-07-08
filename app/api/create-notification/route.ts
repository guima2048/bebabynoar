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

// async function sendEmailNotification(
//   email: string, 
//   userName: string, 
//   title: string, 
//   message: string, 
//   type: string, 
//   data: any
// ) {
//   try {
//     const res = await fetch('https://api.brevo.com/v3/smtp/email', {
//       method: 'POST',
//       headers: {
//         'api-key': process.env.BREVO_API_KEY!,
//         'Content-Type': 'application/json',
//         'accept': 'application/json',
//       },
//       body: JSON.stringify({
//         sender: { name: 'Bebaby App', email: 'no-reply@bebaby.app' },
//         to: [{ email }],
//         subject: `${title} - Bebaby App`,
//         htmlContent: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//             <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
//               <h1 style="color: white; margin: 0; font-size: 28px;">🔔 Nova Notificação</h1>
//             </div>
//             
//             <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
//               <h2 style="color: #333; margin-bottom: 20px;">Olá, ${userName}!</h2>
//               
//               <h3 style="color: #ec4899; margin-bottom: 15px;">${title}</h3>
//               
//               <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
//                 ${message}
//               </p>
//               
//               <div style="text-align: center;">
//                 <a href="${process.env.NEXT_PUBLIC_APP_URL}/notifications" 
//                    style="background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
//                   Ver Notificações
//                 </a>
//               </div>
//               
//               <p style="color: #999; font-size: 14px; margin-top: 25px; text-align: center;">
//                 Você pode gerenciar suas notificações nas configurações da sua conta.
//               </p>
//             </div>
//           </div>
//         `
//       })
//     })

//     if (!res.ok) {
//       console.error('Erro ao enviar e-mail de notificação:', await res.text())
//       throw new Error('Falha ao enviar e-mail')
//     }
//   } catch (error) {
//     console.error('Erro ao enviar e-mail de notificação:', error)
//     throw error
//   }
// } 