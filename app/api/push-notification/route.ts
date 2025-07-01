import { NextRequest, NextResponse } from 'next/server'
import { getFirestoreDB } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, query, where, getDocs, writeBatch, CollectionReference, Query } from 'firebase/firestore'
import { createNotificationSchema, validateAndSanitize, createErrorResponse } from '@/lib/schemas'

// Interface para usuário
interface UserData {
  id: string
  userType?: string
  isPremium?: boolean
  email?: string
}

export async function POST(request: NextRequest) {
  try {
    const db = getFirestoreDB()
    const { title, message, targetUsers = 'all', premiumOnly = false, gender, location } = await request.json()

    if (!title || !message) {
      return NextResponse.json({ error: 'Título e mensagem são obrigatórios' }, { status: 400 })
    }

    // Buscar usuários baseado nos filtros
    let usersQuery: CollectionReference | Query = collection(db, 'users')
    
    if (premiumOnly) {
      usersQuery = query(usersQuery, where('premium', '==', true))
    }
    
    if (gender) {
      usersQuery = query(usersQuery, where('gender', '==', gender))
    }
    
    if (location) {
      usersQuery = query(usersQuery, where('location', '==', location))
    }
    
    const usersSnapshot = await getDocs(usersQuery)
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserData[]

    // Filtrar usuários específicos se necessário
    let filteredUsers = users
    
    if (targetUsers === 'premium') {
      filteredUsers = users.filter(user => user.isPremium)
    } else if (targetUsers === 'sugar_babies') {
      filteredUsers = users.filter(user => user.userType === 'sugar_baby')
    } else if (targetUsers === 'sugar_daddies') {
      filteredUsers = users.filter(user => user.userType === 'sugar_daddy')
    }

    // Enviar notificações
    const notifications = filteredUsers.map(user => ({
      userId: user.id,
      title,
      message,
      type: 'push',
      createdAt: new Date(),
      read: false,
      data: {
        userType: user.userType || '',
        isPremium: user.isPremium || false
      }
    }))

    // Salvar notificações no Firestore
    const batch = writeBatch(db)
    const notificationsRef = collection(db, 'notifications')
    
    notifications.forEach(notification => {
      const docRef = doc(notificationsRef)
      batch.set(docRef, notification)
    })

    await batch.commit()

    // Enviar notificações por email se configurado
    if (process.env.BREVO_API_KEY) {
      const emailPromises = filteredUsers
        .filter(user => user.email)
        .map(user => {
          const emailData = {
            to: [{ email: user.email }],
            subject: title,
            htmlContent: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ec4899;">Bebaby App</h2>
                <h3>${title}</h3>
                <p>${message}</p>
                <p style="margin-top: 20px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" 
                     style="background-color: #ec4899; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Acessar App
                  </a>
                </p>
              </div>
            `
          }

          return fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'api-key': process.env.BREVO_API_KEY ?? '',
            } as HeadersInit,
            body: JSON.stringify(emailData),
          })
        })

      await Promise.allSettled(emailPromises)
    }

    return NextResponse.json({ 
      success: true, 
      message: `Notificação enviada para ${filteredUsers.length} usuários`,
      sentCount: filteredUsers.length
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Registrar token de push do usuário
export async function PUT(req: NextRequest) {
  try {
    const db = getFirestoreDB()
    const { userId, token, platform } = await req.json()

    if (!userId || !token) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const userData = userDoc.data()
    const pushTokens = userData.pushTokens || []

    // Adicionar token se não existir
    if (!pushTokens.includes(token)) {
      pushTokens.push(token)
      
      await updateDoc(doc(db, 'users', userId), {
        pushTokens,
        pushEnabled: true,
        lastPushTokenUpdate: serverTimestamp()
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Token de push registrado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao registrar token de push:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Remover token de push do usuário
export async function DELETE(req: NextRequest) {
  try {
    const db = getFirestoreDB()
    const { userId, token } = await req.json()

    if (!userId || !token) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const userData = userDoc.data()
    const pushTokens = userData.pushTokens || []

    // Remover token
    const updatedTokens = pushTokens.filter((t: string) => t !== token)
    
    await updateDoc(doc(db, 'users', userId), {
      pushTokens: updatedTokens,
      pushEnabled: updatedTokens.length > 0,
      lastPushTokenUpdate: serverTimestamp()
    })

    return NextResponse.json({
      success: true,
      message: 'Token de push removido com sucesso'
    })

  } catch (error) {
    console.error('Erro ao remover token de push:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function sendPushNotification(token: string, title: string, message: string, data?: any) {
  try {
    // Para Firebase Cloud Messaging (FCM)
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${process.env.FIREBASE_SERVER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        notification: {
          title,
          body: message,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          click_action: '/notifications'
        },
        data: {
          ...data,
          click_action: '/notifications',
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
      throw new Error(`FCM failure: ${result.results[0].error}`)
    }

    return result
  } catch (error) {
    console.error('Erro ao enviar push para token:', token, error)
    throw error
  }
} 