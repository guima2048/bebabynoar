import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, socialMedia } = body

    if (!userId || !socialMedia) {
      return NextResponse.json({ error: 'Dados obrigatórios não fornecidos' }, { status: 400 })
    }

    const db = getAdminFirestore()
    if (!db) {
      return NextResponse.json({ error: 'Erro de configuração do banco de dados' }, { status: 500 })
    }

    // Buscar dados atuais do usuário
    const userRef = db.collection('users').doc(userId)
    const userSnap = await userRef.get()
    if (!userSnap.exists) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const userData = userSnap.data()
    const currentSocial = userData?.social || {}

    // Comparar valores antigos com novos e salvar no histórico
    const historyEntries = []
    
    for (const [field, newValue] of Object.entries(socialMedia)) {
      const oldValue = currentSocial[field] || ''
      if (oldValue !== newValue) {
        historyEntries.push({
          userId,
          field,
          oldValue,
          newValue,
          changedBy: 'admin',
          changedAt: new Date(),
          adminId: 'admin' // TODO: Pegar ID do admin logado
        })
      }
    }

    // Salvar alterações no perfil do usuário
    await userRef.update({
      social: socialMedia
    })

    // Salvar entradas no histórico
    if (historyEntries.length > 0) {
      const historyCollection = db.collection('socialMediaHistory')
      for (const entry of historyEntries) {
        await historyCollection.add(entry)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Redes sociais atualizadas com sucesso!',
      changesCount: historyEntries.length
    })

  } catch (error) {
    console.error('Erro ao atualizar redes sociais:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 