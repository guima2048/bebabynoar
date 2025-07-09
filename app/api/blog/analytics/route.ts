import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validação para registrar evento
const recordEventSchema = z.object({
  postId: z.string().min(1, 'ID do post é obrigatório'),
  eventType: z.enum(['view', 'like', 'comment', 'share', 'scroll', 'time_spent']),
  eventData: z.record(z.any()).optional(),
})

// POST - Registrar evento de analytics
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = recordEventSchema.parse(body)

    // Verificar se o post existe
    const post = await prisma.blogPost.findUnique({
      where: { id: validatedData.postId },
      select: { id: true, status: true }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    // Registrar evento
    await prisma.blogAnalytics.create({
      data: {
        postId: validatedData.postId,
        userId: session.user.id,
        eventType: validatedData.eventType,
        eventData: validatedData.eventData || {},
      }
    })

    console.log('✅ Evento registrado:', validatedData.eventType, 'Post:', validatedData.postId)

    return NextResponse.json({
      success: true,
      message: 'Evento registrado com sucesso'
    })

  } catch (error) {
    console.error('❌ Erro ao registrar evento:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Buscar estatísticas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    const period = searchParams.get('period') || '7d' // 7d, 30d, 90d, 1y
    const eventType = searchParams.get('eventType')

    // Calcular data de início baseada no período
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Construir filtros
    const where: any = {
      createdAt: {
        gte: startDate
      }
    }

    if (postId) {
      where.postId = postId
    }

    if (eventType) {
      where.eventType = eventType
    }

    // Buscar estatísticas gerais
    const [
      totalEvents,
      eventsByType,
      topPosts,
      dailyStats
    ] = await Promise.all([
      // Total de eventos
      prisma.blogAnalytics.count({ where }),
      
      // Eventos por tipo
      prisma.blogAnalytics.groupBy({
        by: ['eventType'],
        where,
        _count: {
          eventType: true
        }
      }),
      
      // Posts mais populares
      prisma.blogAnalytics.groupBy({
        by: ['postId'],
        where,
        _count: {
          postId: true
        },
        orderBy: {
          _count: {
            postId: 'desc'
          }
        },
        take: 10
      }),
      
      // Estatísticas diárias
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          event_type,
          COUNT(*) as count
        FROM blog_analytics 
        WHERE created_at >= ${startDate}
        ${postId ? `AND post_id = ${postId}` : ''}
        ${eventType ? `AND event_type = ${eventType}` : ''}
        GROUP BY DATE(created_at), event_type
        ORDER BY date DESC, event_type
      `
    ])

    // Buscar informações dos posts mais populares
    const topPostsWithInfo = await Promise.all(
      topPosts.map(async (post) => {
        const postInfo = await prisma.blogPost.findUnique({
          where: { id: post.postId },
          select: {
            id: true,
            title: true,
            slug: true,
            viewsCount: true,
            likesCount: true,
          }
        })
        
        return {
          postId: post.postId,
          eventCount: post._count.postId,
          post: postInfo
        }
      })
    )

    // Formatar eventos por tipo
    const eventsByTypeFormatted = eventsByType.reduce((acc, item) => {
      acc[item.eventType] = item._count.eventType
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      success: true,
      analytics: {
        period,
        totalEvents,
        eventsByType: eventsByTypeFormatted,
        topPosts: topPostsWithInfo,
        dailyStats,
        dateRange: {
          start: startDate,
          end: now
        }
      }
    })

  } catch (error) {
    console.error('❌ Erro ao buscar analytics:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 