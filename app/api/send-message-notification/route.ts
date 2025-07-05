import { NextRequest, NextResponse } from 'next/server'
import { getFirestoreDB } from '@/lib/firebase'
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'

export async function POST(req: NextRequest) {
  try {
    const db = getFirestoreDB()
    if (!db) {
      return NextResponse.json({ error: 'Erro de conexão com o banco de dados' }, { status: 500 })
    }
    const { senderId, receiverId, message } = await req.json()

    if (!senderId || !receiverId || !message) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Buscar dados do remetente
    const senderDoc = await getDoc(doc(db, 'users', senderId))
    if (!senderDoc.exists()) {
      return NextResponse.json(
        { error: 'Remetente não encontrado' },
        { status: 404 }
      )
    }
    const senderData = senderDoc.data()

    // Buscar dados do destinatário
    const receiverDoc = await getDoc(doc(db, 'users', receiverId))
    if (!receiverDoc.exists()) {
      return NextResponse.json(
        { error: 'Destinatário não encontrado' },
        { status: 404 }
      )
    }
    const receiverData = receiverDoc.data()

    // Verificar se podem conversar (tipos opostos)
    if (senderData.userType === receiverData.userType) {
      return NextResponse.json(
        { error: 'Usuários do mesmo tipo não podem conversar' },
        { status: 403 }
      )
    }

    // Criar notificação interna
    await addDoc(collection(db, 'notifications'), {
      userId: receiverId,
      type: 'new_message',
      title: 'Nova mensagem',
      message: `${senderData.username} enviou uma mensagem para você`,
      data: {
        senderId,
        senderUsername: senderData.username,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        conversationId: [senderId, receiverId].sort().join('_')
      },
      read: false,
      createdAt: serverTimestamp()
    })

    // Enviar e-mail via Brevo (se configurado)
    if (process.env.BREVO_API_KEY && receiverData.email) {
      try {
        const emailData = {
          sender: {
            name: 'Bebaby App',
            email: 'noreply@bebabyapp.com'
          },
          to: [
            {
              email: receiverData.email,
              name: receiverData.username
            }
          ],
          subject: `Nova mensagem de ${senderData.username}`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">Bebaby App</h1>
              </div>
              
              <div style="padding: 30px; background: #f9fafb;">
                <h2 style="color: #374151; margin-bottom: 20px;">Nova mensagem recebida!</h2>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <p style="margin: 0 0 10px 0; color: #6b7280;">
                    <strong>${senderData.username}</strong> enviou uma mensagem para você:
                  </p>
                  <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; border-left: 4px solid #ec4899;">
                    <p style="margin: 0; color: #374151; font-style: italic;">
                      "${message.substring(0, 200)}${message.length > 200 ? '...' : ''}"
                    </p>
                  </div>
                </div>
                
                <div style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/messages/${senderId}" 
                     style="background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Responder Mensagem
                  </a>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
                  <p>Você recebeu este e-mail porque tem notificações ativadas no Bebaby App.</p>
                  <p>Para desativar, acesse suas configurações de perfil.</p>
                </div>
              </div>
            </div>
          `
        }

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': process.env.BREVO_API_KEY
          },
          body: JSON.stringify(emailData)
        })

        if (!response.ok) {
          console.error('Erro ao enviar e-mail via Brevo:', await response.text())
        }
      } catch (error) {
        console.error('Erro ao enviar e-mail:', error)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Notificação enviada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao enviar notificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 