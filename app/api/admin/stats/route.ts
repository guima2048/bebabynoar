import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const db = getAdminFirestore()
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Total de usuários
    const usersSnap = await db.collection('users').get()
    // Usuários premium
    const premiumSnap = await db.collection('users').where('premium', '==', true).get()
    // Denúncias pendentes
    const reportsSnap = await db.collection('reports').where('status', '==', 'pending').get()
    // Conteúdo pendente
    let pendingContent = 0
    try {
      const pendingContentSnap = await db.collection('pendingContent').get()
      pendingContent = pendingContentSnap.size
    } catch {}
    // Posts do blog
    let totalBlogPosts = 0
    try {
      const blogSnap = await db.collection('blog').get()
      totalBlogPosts = blogSnap.size
    } catch {}

    // Novos usuários hoje
    const newUsersTodaySnap = await db.collection('users')
      .where('createdAt', '>=', startOfDay)
      .get()
    const newUsersToday = newUsersTodaySnap.size

    // Usuários online (últimos 10 minutos)
    const onlineUsersSnap = await db.collection('users')
      .where('lastLoginAt', '>=', tenMinutesAgo)
      .get()
    const onlineUsers = onlineUsersSnap.size

    // Conversas ativas (últimas 24h)
    let activeConversations = 0
    try {
      const convSnap = await db.collection('conversations')
        .where('lastMessageAt', '>=', twentyFourHoursAgo)
        .get()
      activeConversations = convSnap.size
    } catch {}

    // Taxa de conversão
    const conversionRate = usersSnap.size > 0 ? Math.round((premiumSnap.size / usersSnap.size) * 100) : 0

    const stats = {
      totalUsers: usersSnap.size,
      premiumUsers: premiumSnap.size,
      pendingReports: reportsSnap.size,
      pendingContent,
      totalBlogPosts,
      newUsersToday,
      onlineUsers,
      activeConversations,
      conversionRate,
      lastUpdated: now.toISOString(),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 