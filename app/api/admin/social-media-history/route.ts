import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário não fornecido' }, { status: 400 })
    }

    // Por enquanto, retornar objetos vazios
    // TODO: Implementar busca de histórico de redes sociais no Prisma
    return NextResponse.json({
      socialMedia: {},
      history: []
    })

  } catch (error) {
    console.error('Erro ao buscar histórico de redes sociais:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 