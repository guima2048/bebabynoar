import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Aqui você buscaria as estatísticas reais do banco de dados
    // const stats = await prisma.$transaction([
    //   prisma.payment.aggregate({
    //     _sum: { amount: true },
    //     _count: true
    //   }),
    //   prisma.payment.count({
    //     where: { status: 'pending' }
    //   }),
    //   prisma.payment.count({
    //     where: { status: 'completed' }
    //   }),
    //   prisma.payment.count({
    //     where: { status: 'failed' }
    //   })
    // ])

    // Por enquanto, retornando dados mockados
    const stats = {
      totalRevenue: 1547.80,
      totalPayments: 65,
      pendingPayments: 3,
      successfulPayments: 58,
      failedPayments: 4
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erro ao buscar estatísticas de pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 