import { NextRequest, NextResponse } from 'next/server'
import { getFirestoreDB } from '@/lib/firebase'
import { doc, getDoc, addDoc, collection, serverTimestamp, setDoc } from 'firebase/firestore'

export async function POST(req: NextRequest) {
  try {
    const db = getFirestoreDB()
    if (!db) {
      return NextResponse.json({ error: 'Erro de conexão com o banco de dados' }, { status: 500 })
    }
    const { senderId, receiverId, initialMessage } = await req.json()

    if (!senderId || !receiverId) {
      return NextResponse.json(
        { error: 'IDs do remetente e destinatário são obrigatórios' },
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

    // Criar ID único para a conversa (ordenado alfabeticamente)
    const conversationId = [senderId, receiverId].sort().join('_')

    // Criar documento da conversa
    await setDoc(doc(db, 'conversations', conversationId), {
      participants: [senderId, receiverId],
      lastMessageTime: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    // Se há mensagem inicial, adicioná-la
    if (initialMessage) {
      await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
        senderId,
        receiverId,
        content: initialMessage,
        timestamp: serverTimestamp(),
        read: false
      })

      // Enviar notificação
      await fetch('/api/send-message-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId,
          receiverId,
          message: initialMessage
        })
      })
    }

    return NextResponse.json({
      success: true,
      conversationId,
      message: 'Conversa iniciada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao iniciar conversa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 