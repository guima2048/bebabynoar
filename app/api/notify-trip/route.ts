import { NextRequest, NextResponse } from 'next/server'
import { getFirestoreDB } from '@/lib/firebase'
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore'

export async function POST(req: NextRequest) {
  const { state, city, start, end, userId, username } = await req.json()
  if (!state || !city || !start || !end || !userId || !username) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
  }
  try {
    const db = getFirestoreDB()
    if (!db) {
      return NextResponse.json({ error: 'Erro de conexão com o banco de dados' }, { status: 500 })
    }
    if (!db) return NextResponse.json({ error: 'DB não configurado' }, { status: 500 })
    // Buscar todos os usuários do estado
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('state', '==', state))
    const snap = await getDocs(q)
    const notificados: string[] = []
    for (const docu of snap.docs) {
      const data = docu.data()
      if (data.id === userId) continue // não notificar o próprio usuário
      // Criar notificação
      await addDoc(collection(db, 'notifications'), {
        userId: docu.id,
        type: 'trip',
        title: 'Usuário vai visitar sua região!',
        message: `${username} estará em ${city} (${state}) de ${start} até ${end}. Que tal dar boas-vindas?`,
        createdAt: new Date().toISOString(),
        read: false,
      })
      // (Opcional: enviar email/push aqui)
      notificados.push(docu.id)
    }
    return NextResponse.json({ success: true, notified: notificados.length })
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao notificar usuários' }, { status: 500 })
  }
} 