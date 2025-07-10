import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    
    // Buscar dados reais do banco com tratamento de erro individual
    let totalUsers = 0, activeUsers = 0, premiumUsers = 0, pendingReports = 0
    let totalBlogPosts = 0, newUsersToday = 0, pendingContent = 0

    try {
      totalUsers = await prisma.user.count()
    } catch (error) {
      console.error('Erro ao contar usuários totais:', error)
    }

    try {
      activeUsers = await prisma.user.count({ where: { status: 'ACTIVE' } })
    } catch (error) {
      console.error('Erro ao contar usuários ativos:', error)
    }

    try {
      premiumUsers = await prisma.user.count({ where: { premium: true } })
    } catch (error) {
      console.error('Erro ao contar usuários premium:', error)
    }

    try {
      pendingReports = await prisma.report.count({ where: { status: 'PENDING' } })
    } catch (error) {
      console.error('Erro ao contar denúncias pendentes:', error)
    }

    try {
      totalBlogPosts = await prisma.blogPost.count()
    } catch (error) {
      console.error('Erro ao contar posts do blog:', error)
    }

    try {
      newUsersToday = await prisma.user.count({ 
        where: { 
          createdAt: { 
            gte: new Date(new Date().setHours(0, 0, 0, 0)) 
          } 
        } 
      })
    } catch (error) {
      console.error('Erro ao contar novos usuários hoje:', error)
    }

    try {
      pendingContent = await prisma.user.count({ where: { status: 'PENDING' } })
    } catch (error) {
      console.error('Erro ao contar conteúdo pendente:', error)
    }



    // Calcular estatísticas derivadas (estimativas baseadas em dados reais)
    const onlineUsers = Math.floor(activeUsers * 0.15) // 15% dos ativos online
    const activeConversations = Math.floor(activeUsers * 0.4) // 40% dos ativos em conversas

    const stats = {
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
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
} 