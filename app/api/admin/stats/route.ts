import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  // Autenticação admin
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')
  if (!adminSession || adminSession.value !== 'authenticated') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Buscar estatísticas no banco
  const totalUsers = await prisma.user.count()
  const activeUsers = await prisma.user.count({ where: { status: 'ACTIVE' } })
  const premiumUsers = await prisma.user.count({ where: { premium: true } })
  const pendingReports = await prisma.report.count({ where: { status: 'PENDING' } }).catch(() => 0)
  const pendingContent = 0 // Adapte se houver lógica para conteúdo pendente
  const totalBlogPosts = 0
  const activeConversations = 0 // Adapte se houver lógica para conversas
  const newUsersToday = await prisma.user.count({ where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } })
  const onlineUsers = 0 // Adapte se houver lógica para usuários online

  return NextResponse.json({
    totalUsers,
    activeUsers,
    premiumUsers,
    pendingReports,
    pendingContent,
    totalBlogPosts,
    activeConversations,
    newUsersToday,
    onlineUsers,
    lastUpdated: new Date().toISOString()
  })
} 