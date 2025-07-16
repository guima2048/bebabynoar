import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const templates = await prisma.emailTemplate.findMany({
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Erro ao buscar templates:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { slug, name, subject, body: templateBody, enabled } = body

    // Validação
    if (!slug || !name || !subject || !templateBody) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 })
    }

    // Salvar ou atualizar template
    const template = await prisma.emailTemplate.upsert({
      where: { slug },
      update: {
        name,
        subject,
        body: templateBody,
        enabled: enabled ?? true
      },
      create: {
        slug,
        name,
        subject,
        body: templateBody,
        enabled: enabled ?? true
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Erro ao salvar template:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 