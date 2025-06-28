import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore'

export async function GET(request: NextRequest) {
  try {
    // Verificar se é uma requisição administrativa
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Retornar dados de teste se não houver autorização
      return NextResponse.json({
        period: 30,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        
        users: {
          total: 1250,
          new: 45,
          premium: 89,
          sugarBabies: 750,
          sugarDaddies: 500,
          verified: 980,
        },

        activity: {
          totalMessages: 3450,
          recentMessages: 120,
          averageMessagesPerDay: 4,
          topActiveUsers: [
            { id: '1', name: 'Maria Silva', email: 'maria@test.com', messageCount: 45, userType: 'sugar_baby' },
            { id: '2', name: 'João Santos', email: 'joao@test.com', messageCount: 38, userType: 'sugar_daddy' },
          ],
        },

        reports: {
          total: 23,
          recent: 5,
          pending: 3,
          resolved: 20,
          resolutionRate: 87,
        },

        moderation: {
          totalActions: 156,
          recentActions: 12,
          approved: 120,
          rejected: 25,
          flagged: 8,
          deleted: 3,
        },

        payments: {
          total: 15000,
          thisMonth: 2500,
          premiumSubscriptions: 8900,
          averagePerUser: 99.90,
        },

        growth: {
          daily: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            newUsers: Math.floor(Math.random() * 5) + 1,
            premiumUsers: Math.floor(Math.random() * 3),
          })),
          userGrowthRate: 3.6,
          premiumGrowthRate: 2.1,
        },

        engagement: {
          totalUsers: 1250,
          activeUsers: 890,
          premiumConversionRate: 7.1,
          averageMessagesPerUser: 2.8,
          reportRate: 1.8,
        },

        charts: {
          userTypes: {
            sugarBabies: 750,
            sugarDaddies: 500,
          },
          premiumStatus: {
            premium: 89,
            free: 1161,
          },
          reportStatus: {
            pending: 3,
            resolved: 20,
          },
          moderationActions: {
            approved: 120,
            rejected: 25,
            flagged: 8,
            deleted: 3,
          },
        },
      })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // dias

    // Calcular datas
    const now = new Date()
    const startDate = new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000)

    // Estatísticas de usuários
    interface UserWithMeta {
      id: string;
      createdAt?: any;
      userType?: string;
      isPremium?: boolean;
      emailVerified?: boolean;
      lastActiveAt?: any;
      name?: string;
      email?: string;
    }
    const usersRef = collection(db, 'users')
    const allUsers = await getDocs(usersRef)
    const users = allUsers.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserWithMeta[]

    const newUsers = users.filter(user => 
      user.createdAt && (
        user.createdAt?.toDate?.() >= startDate || 
        new Date(user.createdAt) >= startDate
      )
    )

    const premiumUsers = users.filter(user => user.isPremium)
    const sugarBabies = users.filter(user => user.userType === 'sugar-baby')
    const sugarDaddies = users.filter(user => user.userType === 'sugar-daddy')

    // Estatísticas de atividade
    interface MessageWithMeta {
      id: string;
      createdAt?: any;
      userId?: string;
      senderId?: string;
    }
    const messagesRef = collection(db, 'messages')
    const allMessages = await getDocs(messagesRef)
    const messages = allMessages.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MessageWithMeta[]

    const recentMessages = messages.filter(message => 
      message.createdAt?.toDate?.() >= startDate || 
      new Date(message.createdAt) >= startDate
    )

    // Estatísticas de denúncias
    interface ReportWithMeta {
      id: string;
      createdAt?: any;
      status?: string;
    }
    const reportsRef = collection(db, 'reports')
    const allReports = await getDocs(reportsRef)
    const reports = allReports.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ReportWithMeta[]

    const recentReports = reports.filter(report => 
      report.createdAt?.toDate?.() >= startDate || 
      new Date(report.createdAt) >= startDate
    )

    const pendingReports = reports.filter(report => report.status === 'pending')
    const resolvedReports = reports.filter(report => report.status === 'resolved')

    // Estatísticas de moderação
    interface ModerationWithMeta {
      id: string;
      createdAt?: any;
      action?: string;
    }
    const moderationRef = collection(db, 'moderationLog')
    const allModeration = await getDocs(moderationRef)
    const moderation = allModeration.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ModerationWithMeta[]

    const recentModeration = moderation.filter(log => 
      log.createdAt?.toDate?.() >= startDate || 
      new Date(log.createdAt) >= startDate
    )

    // Estatísticas de pagamentos (mockado por enquanto)
    const mockPayments = {
      total: 15000,
      thisMonth: 2500,
      premiumSubscriptions: premiumUsers.length * 99.90,
      averagePerUser: premiumUsers.length > 0 ? (premiumUsers.length * 99.90) / premiumUsers.length : 0,
    }

    // Usuários mais ativos
    const userActivity: Record<string, number> = {}
    messages.forEach(message => {
      const userId = message.userId || message.senderId
      if (userId) {
        userActivity[userId] = (userActivity[userId] || 0) + 1
      }
    })

    const topActiveUsers = Object.entries(userActivity)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([userId, count]) => {
        const user = users.find(u => u.id === userId)
        return {
          id: userId,
          name: user?.name || 'Usuário',
          email: user?.email || '',
          messageCount: count,
          userType: user?.userType || 'unknown',
        }
      })

    // Crescimento por dia (últimos 30 dias)
    const dailyGrowth = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      
      const dayUsers = users.filter(user => {
        const userDate = user.createdAt?.toDate?.() || new Date(user.createdAt)
        return userDate >= dayStart && userDate < dayEnd
      })

      dailyGrowth.push({
        date: dayStart.toISOString().split('T')[0],
        newUsers: dayUsers.length,
        premiumUsers: dayUsers.filter(u => u.isPremium).length,
      })
    }

    // Estatísticas de engajamento
    const engagementStats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.lastActiveAt?.toDate?.() >= startDate || new Date(u.lastActiveAt) >= startDate).length,
      premiumConversionRate: users.length > 0 ? (premiumUsers.length / users.length) * 100 : 0,
      averageMessagesPerUser: users.length > 0 ? messages.length / users.length : 0,
      reportRate: users.length > 0 ? (reports.length / users.length) * 100 : 0,
    }

    return NextResponse.json({
      period: parseInt(period),
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      
      users: {
        total: users.length,
        new: newUsers.length,
        premium: premiumUsers.length,
        sugarBabies: sugarBabies.length,
        sugarDaddies: sugarDaddies.length,
        verified: users.filter(u => u.emailVerified).length,
      },

      activity: {
        totalMessages: messages.length,
        recentMessages: recentMessages.length,
        averageMessagesPerDay: recentMessages.length / parseInt(period),
        topActiveUsers,
      },

      reports: {
        total: reports.length,
        recent: recentReports.length,
        pending: pendingReports.length,
        resolved: resolvedReports.length,
        resolutionRate: reports.length > 0 ? (resolvedReports.length / reports.length) * 100 : 0,
      },

      moderation: {
        totalActions: moderation.length,
        recentActions: recentModeration.length,
        approved: moderation.filter(m => m.action === 'approve').length,
        rejected: moderation.filter(m => m.action === 'reject').length,
        flagged: moderation.filter(m => m.action === 'flag').length,
        deleted: moderation.filter(m => m.action === 'delete').length,
      },

      payments: mockPayments,

      growth: {
        daily: dailyGrowth,
        userGrowthRate: users.length > 0 ? (newUsers.length / users.length) * 100 : 0,
        premiumGrowthRate: premiumUsers.length > 0 ? (newUsers.filter(u => u.isPremium).length / premiumUsers.length) * 100 : 0,
      },

      engagement: engagementStats,

      // Dados para gráficos
      charts: {
        userTypes: {
          sugarBabies: sugarBabies.length,
          sugarDaddies: sugarDaddies.length,
        },
        premiumStatus: {
          premium: premiumUsers.length,
          free: users.length - premiumUsers.length,
        },
        reportStatus: {
          pending: pendingReports.length,
          resolved: resolvedReports.length,
        },
        moderationActions: {
          approved: moderation.filter(m => m.action === 'approve').length,
          rejected: moderation.filter(m => m.action === 'reject').length,
          flagged: moderation.filter(m => m.action === 'flag').length,
          deleted: moderation.filter(m => m.action === 'delete').length,
        },
      },
    })

  } catch (error) {
    // Retornar dados de teste em caso de erro
    return NextResponse.json({
      period: 30,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
      
      users: {
        total: 1250,
        new: 45,
        premium: 89,
        sugarBabies: 750,
        sugarDaddies: 500,
        verified: 980,
      },

      activity: {
        totalMessages: 3450,
        recentMessages: 120,
        averageMessagesPerDay: 4,
        topActiveUsers: [
          { id: '1', name: 'Maria Silva', email: 'maria@test.com', messageCount: 45, userType: 'sugar_baby' },
          { id: '2', name: 'João Santos', email: 'joao@test.com', messageCount: 38, userType: 'sugar_daddy' },
        ],
      },

      reports: {
        total: 23,
        recent: 5,
        pending: 3,
        resolved: 20,
        resolutionRate: 87,
      },

      moderation: {
        totalActions: 156,
        recentActions: 12,
        approved: 120,
        rejected: 25,
        flagged: 8,
        deleted: 3,
      },

      payments: {
        total: 15000,
        thisMonth: 2500,
        premiumSubscriptions: 8900,
        averagePerUser: 99.90,
      },

      growth: {
        daily: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          newUsers: Math.floor(Math.random() * 5) + 1,
          premiumUsers: Math.floor(Math.random() * 3),
        })),
        userGrowthRate: 3.6,
        premiumGrowthRate: 2.1,
      },

      engagement: {
        totalUsers: 1250,
        activeUsers: 890,
        premiumConversionRate: 7.1,
        averageMessagesPerUser: 2.8,
        reportRate: 1.8,
      },

      charts: {
        userTypes: {
          sugarBabies: 750,
          sugarDaddies: 500,
        },
        premiumStatus: {
          premium: 89,
          free: 1161,
        },
        reportStatus: {
          pending: 3,
          resolved: 20,
        },
        moderationActions: {
          approved: 120,
          rejected: 25,
          flagged: 8,
          deleted: 3,
        },
      },
    })
  }
} 