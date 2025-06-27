import { NextRequest, NextResponse } from 'next/server'
import { db, collection, addDoc, serverTimestamp, doc, getDoc, query, where, getDocs, updateDoc } from '@/lib/firebase'
import { sendInterestSchema, respondInterestSchema, validateAndSanitize, createErrorResponse } from '@/lib/schemas'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validação Zod
    const validation = validateAndSanitize(sendInterestSchema, body)
    if (!validation.success) {
      return NextResponse.json(createErrorResponse(validation.errors), { status: 400 })
    }
    
    const { senderId, receiverId, message } = validation.data

    if (!senderId || !receiverId) {
      return NextResponse.json(
        { error: 'IDs do remetente e destinatário são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se os usuários existem
    const senderDoc = await getDoc(doc(db, 'users', senderId))
    const receiverDoc = await getDoc(doc(db, 'users', receiverId))

    if (!senderDoc.exists() || !receiverDoc.exists()) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const senderData = senderDoc.data()
    const receiverData = receiverDoc.data()

    // Verificar se já enviou interesse recentemente
    const existingInterest = await getDocs(
      query(
        collection(db, 'interests'),
        where('senderId', '==', senderId),
        where('receiverId', '==', receiverId),
        where('status', 'in', ['pending', 'accepted'])
      )
    )

    if (!existingInterest.empty) {
      return NextResponse.json(
        { error: 'Você já enviou interesse para este usuário' },
        { status: 400 }
      )
    }

    // Criar interesse
    const interestData = {
      senderId,
      receiverId,
      message: message || '',
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const interestRef = await addDoc(collection(db, 'interests'), interestData)

    // Criar notificação para o destinatário
    const notificationData = {
      userId: receiverId,
      type: 'interest',
      title: `${senderData.name} demonstrou interesse em você!`,
      message: message || 'Clique para ver o perfil completo',
      data: {
        senderId,
        senderName: senderData.name,
        senderPhoto: senderData.photos?.[0] || null,
        interestId: interestRef.id
      },
      read: false,
      createdAt: serverTimestamp()
    }

    await addDoc(collection(db, 'notifications'), notificationData)

    // Enviar notificação push se habilitada
    if (receiverData.pushEnabled && receiverData.pushTokens?.length > 0) {
      try {
        await sendPushNotification(
          receiverData.pushTokens,
          `${senderData.name} demonstrou interesse em você!`,
          message || 'Clique para ver o perfil completo',
          {
            type: 'interest',
            senderId,
            interestId: interestRef.id
          }
        )
      } catch (pushError) {
        console.error('Erro ao enviar push notification:', pushError)
      }
    }

    // Enviar e-mail se habilitado
    if (receiverData.notificationSettings?.emailInterests && receiverData.email) {
      try {
        await sendEmailNotification(
          receiverData.email,
          (receiverData.name || 'Usuário'),
          (senderData.name || ''),
          (message || ''),
          interestRef.id
        )
      } catch (emailError) {
        console.error('Erro ao enviar e-mail de notificação:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      interestId: interestRef.id,
      message: 'Interesse enviado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao enviar interesse:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Responder ao interesse
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validação Zod
    const validation = validateAndSanitize(respondInterestSchema, body)
    if (!validation.success) {
      return NextResponse.json(createErrorResponse(validation.errors), { status: 400 })
    }
    
    const { interestId, response, message } = validation.data

    // Buscar interesse
    const interestDoc = await getDoc(doc(db, 'interests', interestId))
    if (!interestDoc.exists()) {
      return NextResponse.json(
        { error: 'Interesse não encontrado' },
        { status: 404 }
      )
    }

    const interestData = interestDoc.data()

    // Atualizar interesse
    await updateDoc(doc(db, 'interests', interestId), {
      status: response,
      responseMessage: message || '',
      respondedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    // Buscar dados dos usuários
    const senderDoc = await getDoc(doc(db, 'users', interestData.senderId))
    const receiverDoc = await getDoc(doc(db, 'users', interestData.receiverId))

    const senderData = senderDoc.exists() ? senderDoc.data() : null
    const receiverData = receiverDoc.exists() ? receiverDoc.data() : null

    // Criar notificação para o remetente
    if (senderData) {
      const notificationTitle = response === 'accepted' 
        ? `${receiverData?.name} aceitou seu interesse!` 
        : `${receiverData?.name} não aceitou seu interesse`

      const notificationData = {
        userId: interestData.senderId,
        type: 'interest_response',
        title: notificationTitle,
        message: message || (response === 'accepted' ? 'Vocês podem começar a conversar!' : 'Não desanime, continue tentando!'),
        data: {
          receiverId: interestData.receiverId,
          receiverName: receiverData?.name,
          receiverPhoto: receiverData?.photos?.[0] || null,
          interestId,
          response
        },
        read: false,
        createdAt: serverTimestamp()
      }

      await addDoc(collection(db, 'notifications'), notificationData)

      // Enviar push notification se habilitado
      if (senderData.pushEnabled && senderData.pushTokens?.length > 0) {
        try {
          await sendPushNotification(
            senderData.pushTokens,
            notificationTitle,
            message || (response === 'accepted' ? 'Vocês podem começar a conversar!' : 'Não desanime, continue tentando!'),
            {
              type: 'interest_response',
              receiverId: interestData.receiverId,
              interestId,
              response
            }
          )
        } catch (pushError) {
          console.error('Erro ao enviar push notification:', pushError)
        }
      }

      // Enviar e-mail se habilitado
      if (senderData.notificationSettings?.emailInterests && senderData.email) {
        try {
          await sendEmailNotification(
            senderData.email,
            (senderData.name || ''),
            (receiverData?.name || 'Usuário'),
            (message || (response === 'accepted' ? 'Vocês podem começar a conversar!' : 'Não desanime, continue tentando!')),
            interestId
          )
        } catch (emailError) {
          console.error('Erro ao enviar e-mail de notificação:', emailError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Interesse ${response === 'accepted' ? 'aceito' : 'rejeitado'} com sucesso`
    })

  } catch (error) {
    console.error('Erro ao responder interesse:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function sendPushNotification(tokens: string[], title: string, message: string, data: any) {
  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${process.env.FIREBASE_SERVER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registration_ids: tokens,
        notification: {
          title,
          body: message,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          click_action: '/profile'
        },
        data: {
          ...data,
          click_action: '/profile',
          timestamp: Date.now().toString()
        },
        priority: 'high'
      })
    })

    if (!response.ok) {
      throw new Error(`FCM error: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.failure > 0) {
      console.warn('Alguns push notifications falharam:', result.results)
    }

    return result
  } catch (error) {
    console.error('Erro ao enviar push notification:', error)
    throw error
  }
}

async function sendEmailNotification(
  email: string, 
  receiverName: string, 
  senderName: string, 
  message: string, 
  interestId: string
) {
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY!,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Bebaby App', email: 'no-reply@bebaby.app' },
        to: [{ email }],
        subject: `${senderName} demonstrou interesse em você! - Bebaby App`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">💕 Novo Interesse!</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">Olá, ${receiverName}!</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                <strong>${senderName}</strong> demonstrou interesse em você no Bebaby App!
              </p>
              
              ${message ? `
                <div style="background: #f8f9fa; border-left: 4px solid #ec4899; padding: 20px; margin-bottom: 25px;">
                  <p style="color: #333; font-style: italic; margin: 0;">
                    "${message}"
                  </p>
                </div>
              ` : ''}
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/${senderName}" 
                   style="background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                  Ver Perfil
                </a>
              </div>
              
              <p style="color: #999; font-size: 14px; margin-top: 25px; text-align: center;">
                Responda rapidamente para não perder essa oportunidade! 💖
              </p>
            </div>
          </div>
        `
      })
    })

    if (!res.ok) {
      console.error('Erro ao enviar e-mail de notificação:', await res.text())
      throw new Error('Falha ao enviar e-mail')
    }
  } catch (error) {
    console.error('Erro ao enviar e-mail de notificação:', error)
    throw error
  }
} 