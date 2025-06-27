import { NextRequest, NextResponse } from 'next/server'
import { db, collection, addDoc, serverTimestamp, doc, updateDoc, getDoc, query, where, getDocs, orderBy, limit } from '@/lib/firebase'

export async function POST(req: NextRequest) {
  try {
    const { viewerId, viewedUserId } = await req.json()

    if (!viewerId || !viewedUserId) {
      return NextResponse.json(
        { error: 'IDs do visualizador e usuário visualizado são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se os usuários existem
    const viewerDoc = await getDoc(doc(db, 'users', viewerId))
    const viewedUserDoc = await getDoc(doc(db, 'users', viewedUserId))

    if (!viewerDoc.exists() || !viewedUserDoc.exists()) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Não registrar visualização própria
    if (viewerId === viewedUserId) {
      return NextResponse.json({
        success: true,
        message: 'Visualização própria não registrada'
      })
    }

    // Verificar se já visualizou recentemente (últimas 24 horas)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const recentView = await getDocs(
      query(
        collection(db, 'profileViews'),
        where('viewerId', '==', viewerId),
        where('viewedUserId', '==', viewedUserId),
        where('viewedAt', '>', oneDayAgo)
      )
    )

    if (!recentView.empty) {
      return NextResponse.json({
        success: true,
        message: 'Visualização já registrada recentemente'
      })
    }

    // Registrar visualização
    const viewData = {
      viewerId,
      viewedUserId,
      viewedAt: serverTimestamp(),
      viewerIP: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown'
    }

    await addDoc(collection(db, 'profileViews'), viewData)

    // Atualizar contador de visualizações do usuário visualizado
    const viewedUserData = viewedUserDoc.data()
    const currentViews = viewedUserData.profileViews || 0
    
    await updateDoc(doc(db, 'users', viewedUserId), {
      profileViews: currentViews + 1,
      lastViewedAt: serverTimestamp()
    })

    return NextResponse.json({
      success: true,
      message: 'Visualização registrada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao registrar visualização:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Buscar visualizações de um usuário
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const limitCount = parseInt(searchParams.get('limit') || '20')

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
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

    // Buscar visualizações recentes
    const viewsQuery = await getDocs(
      query(
        collection(db, 'profileViews'),
        where('viewedUserId', '==', userId),
        orderBy('viewedAt', 'desc'),
        limit(limitCount)
      )
    )

    const views = []

    for (const viewDoc of viewsQuery.docs) {
      const viewData = viewDoc.data()
      
      // Buscar dados do visualizador
      const viewerDoc = await getDoc(doc(db, 'users', viewData.viewerId))
      if (viewerDoc.exists()) {
        const viewerData = viewerDoc.data()
        views.push({
          id: viewDoc.id,
          viewerId: viewData.viewerId,
          viewerName: viewerData.name,
          viewerAge: viewerData.age,
          viewerPhoto: viewerData.photos?.[0] || null,
          viewedAt: viewData.viewedAt?.toDate()
        })
      }
    }

    return NextResponse.json({
      success: true,
      views,
      total: views.length
    })

  } catch (error) {
    console.error('Erro ao buscar visualizações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 