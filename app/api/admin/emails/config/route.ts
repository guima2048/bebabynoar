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

    const config = await prisma.smtpConfig.findUnique({
      where: { id: 'main' }
    })

    if (!config) {
      return NextResponse.json({
        host: 'smtplw.com.br',
        port: 587,
        user: '',
        pass: '',
        token: '',
        from: 'BeBaby <contato@bebaby.app>'
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Erro ao buscar configuração SMTP:', error)
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
    const { host, port, user, pass, token, from } = body

    // Validação
    if (!host || !user || !token || !from) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 })
    }

    // Salvar ou atualizar configuração
    const config = await prisma.smtpConfig.upsert({
      where: { id: 'main' },
      update: {
        host,
        port: parseInt(port) || 587,
        user,
        pass: pass || '',
        token,
        from
      },
      create: {
        id: 'main',
        host,
        port: parseInt(port) || 587,
        user,
        pass: pass || '',
        token,
        from
      }
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Erro ao salvar configuração SMTP:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 