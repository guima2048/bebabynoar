import { NextRequest, NextResponse } from 'next/server'
import { db, collection, addDoc, serverTimestamp, doc, updateDoc, getDoc, query, where, getDocs } from '@/lib/firebase'

export async function POST(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Erro de configuração do banco de dados' }, { status: 500 });
    }
    const { requesterId, targetUserId, message } = await req.json()

    if (!requesterId || !targetUserId) {
      return NextResponse.json(
        { error: 'IDs do solicitante e usuário alvo são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se os usuários existem
    const requesterDoc = await getDoc(doc(db, 'users', requesterId))
    const targetUserDoc = await getDoc(doc(db, 'users', targetUserId))

    if (!requesterDoc.exists() || !targetUserDoc.exists()) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const requesterData = requesterDoc.data()
    const targetUserData = targetUserDoc.data()

    // Verificar se já solicitou recentemente
    const existingRequest = await getDocs(
      query(
        collection(db, 'privatePhotoRequests'),
        where('requesterId', '==', requesterId),
        where('targetUserId', '==', targetUserId),
        where('status', 'in', ['pending', 'accepted'])
      )
    )

    if (!existingRequest.empty) {
      return NextResponse.json(
        { error: 'Você já solicitou fotos privadas deste usuário' },
        { status: 400 }
      )
    }

    // Criar solicitação
    const requestData = {
      requesterId,
      targetUserId,
      message: message || '',
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const requestRef = await addDoc(collection(db, 'privatePhotoRequests'), requestData)

    // Criar notificação para o usuário alvo
    const notificationData = {
      userId: targetUserId,
      type: 'private_photo_request',
      title: `${requesterData.name} solicitou suas fotos privadas`,
      message: message || 'Clique para responder à solicitação',
      data: {
        requesterId,
        requesterName: requesterData.name,
        requesterPhoto: requesterData.photos?.[0] || null,
        requestId: requestRef.id
      },
      read: false,
      createdAt: serverTimestamp()
    }

    await addDoc(collection(db, 'notifications'), notificationData)

    // Enviar notificação push se habilitada
    if (targetUserData.pushEnabled && targetUserData.pushTokens?.length > 0) {
      try {
        await sendPushNotification(
          targetUserData.pushTokens,
          `${requesterData.name} solicitou suas fotos privadas`,
          message || 'Clique para responder à solicitação',
          {
            type: 'private_photo_request',
            requesterId,
            requestId: requestRef.id
          }
        )
      } catch (pushError) {
        console.error('Erro ao enviar push notification:', pushError)
      }
    }

    // Enviar e-mail se habilitado
    if (targetUserData.notificationSettings?.emailPrivatePhotoRequests) {
      try {
        await sendEmailNotification(
          targetUserData.email,
          targetUserData.name,
          requesterData.name,
          message,
          requestRef.id
        )
      } catch (emailError) {
        console.error('Erro ao enviar e-mail de notificação:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      requestId: requestRef.id,
      message: 'Solicitação enviada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao solicitar fotos privadas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Responder à solicitação de fotos privadas
export async function PUT(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Erro de configuração do banco de dados' }, { status: 500 });
    }
    const { requestId, response, message } = await req.json()

    if (!requestId || !response) {
      return NextResponse.json(
        { error: 'ID da solicitação e resposta são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar resposta
    if (!['accepted', 'rejected'].includes(response)) {
      return NextResponse.json(
        { error: 'Resposta inválida' },
        { status: 400 }
      )
    }

    // Buscar solicitação
    const requestDoc = await getDoc(doc(db, 'privatePhotoRequests', requestId))
    if (!requestDoc.exists()) {
      return NextResponse.json(
        { error: 'Solicitação não encontrada' },
        { status: 404 }
      )
    }

    const requestData = requestDoc.data()

    // Atualizar solicitação
    await updateDoc(doc(db, 'privatePhotoRequests', requestId), {
      status: response,
      responseMessage: message || '',
      respondedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    // Buscar dados dos usuários
    const requesterDoc = await getDoc(doc(db, 'users', requestData.requesterId))
    const targetUserDoc = await getDoc(doc(db, 'users', requestData.targetUserId))

    const requesterData = requesterDoc.exists() ? requesterDoc.data() : null
    const targetUserData = targetUserDoc.exists() ? targetUserDoc.data() : null

    // Criar notificação para o solicitante
    if (requesterData) {
      const notificationTitle = response === 'accepted' 
        ? `${targetUserData?.name} aceitou sua solicitação de fotos privadas!` 
        : `${targetUserData?.name} não aceitou sua solicitação de fotos privadas`

      const notificationData = {
        userId: requestData.requesterId,
        type: 'private_photo_response',
        title: notificationTitle,
        message: message || (response === 'accepted' ? 'Você pode ver as fotos privadas agora!' : 'Respeite a decisão do usuário'),
        data: {
          targetUserId: requestData.targetUserId,
          targetUserName: targetUserData?.name,
          targetUserPhoto: targetUserData?.photos?.[0] || null,
          requestId,
          response
        },
        read: false,
        createdAt: serverTimestamp()
      }

      await addDoc(collection(db, 'notifications'), notificationData)

      // Enviar push notification se habilitado
      if (requesterData.pushEnabled && requesterData.pushTokens?.length > 0) {
        try {
          await sendPushNotification(
            requesterData.pushTokens,
            notificationTitle,
            message || (response === 'accepted' ? 'Você pode ver as fotos privadas agora!' : 'Respeite a decisão do usuário'),
            {
              type: 'private_photo_response',
              targetUserId: requestData.targetUserId,
              requestId,
              response
            }
          )
        } catch (pushError) {
          console.error('Erro ao enviar push notification:', pushError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: response === 'accepted' ? 'Solicitação aceita com sucesso' : 'Solicitação rejeitada'
    })

  } catch (error) {
    console.error('Erro ao responder solicitação de fotos privadas:', error)
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
  targetUserName: string, 
  requesterName: string, 
  message: string, 
  requestId: string
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
        subject: `${requesterName} solicitou suas fotos privadas - Bebaby App`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">📸 Solicitação de Fotos</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">Olá, ${targetUserName}!</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                <strong>${requesterName}</strong> solicitou acesso às suas fotos privadas no Bebaby App.
              </p>
              
              ${message ? `
                <div style="background: #f8f9fa; border-left: 4px solid #ec4899; padding: 20px; margin-bottom: 25px;">
                  <p style="color: #333; font-style: italic; margin: 0;">
                    "${message}"
                  </p>
                </div>
              ` : ''}
              
              <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h3 style="color: #92400e; margin-bottom: 10px; font-size: 16px;">⚠️ Lembre-se:</h3>
                <ul style="color: #92400e; line-height: 1.6; margin: 0; padding-left: 20px; font-size: 14px;">
                  <li>Só compartilhe fotos que você se sinta confortável</li>
                  <li>Você pode recusar sem dar explicação</li>
                  <li>Respeite seus próprios limites</li>
                  <li>Denuncie qualquer comportamento inadequado</li>
                </ul>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/requests" 
                   style="background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                  Responder Solicitação
                </a>
              </div>
              
              <p style="color: #999; font-size: 14px; margin-top: 25px; text-align: center;">
                Sua privacidade e segurança são nossas prioridades! 🔒
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