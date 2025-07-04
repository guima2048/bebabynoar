import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário não fornecido' }, { status: 400 })
    }

    const db = getAdminFirestore()
    if (!db) {
      return NextResponse.json({ error: 'Erro de configuração do banco de dados' }, { status: 500 })
    }

    // Buscar dados do usuário
    const userRef = db.collection('users').doc(userId)
    const userSnap = await userRef.get()
    if (!userSnap.exists) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const userData = userSnap.data()
    const socialMedia = userData?.social || {}

    // Buscar histórico de alterações
    const historySnap = await db.collection('socialMediaHistory')
      .where('userId', '==', userId)
      .orderBy('changedAt', 'desc')
      .get()

    const history: any[] = []

    historySnap.forEach((doc) => {
      const data = doc.data()
      history.push({
        id: doc.id,
        field: data.field,
        oldValue: data.oldValue,
        newValue: data.newValue,
        changedBy: data.changedBy,
        changedAt: data.changedAt?.toDate?.() || data.changedAt,
        adminId: data.adminId
      })
    })

    return NextResponse.json({
      socialMedia,
      history
    })

  } catch (error) {
    console.error('Erro ao buscar histórico de redes sociais:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 