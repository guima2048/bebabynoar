import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const { plan, amount, method } = await request.json()
    const userId = session.user.id

    if (!plan || !amount) {
      return NextResponse.json(
        { error: 'Plano e valor são obrigatórios' },
        { status: 400 }
      )
    }

    // Registrar tentativa de pagamento
    const payment = await prisma.payment.create({
      data: {
        userId,
        plan,
        amount: parseFloat(amount),
        method: method || 'pix',
        status: 'PENDING'
      }
    })

    // Aqui você pode integrar com gateway de pagamento
    // Por exemplo: Mercado Pago, PagSeguro, etc.

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      message: 'Pagamento registrado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao processar pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}