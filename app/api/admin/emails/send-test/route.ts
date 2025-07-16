import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { templateSlug, testEmail } = body

    if (!templateSlug || !testEmail) {
      return NextResponse.json({ error: 'Template e e-mail são obrigatórios' }, { status: 400 })
    }

    // Buscar configuração SMTP
    const smtpConfig = await prisma.smtpConfig.findUnique({
      where: { id: 'main' }
    })

    if (!smtpConfig) {
      return NextResponse.json({ error: 'Configuração SMTP não encontrada' }, { status: 400 })
    }

    // Buscar template
    const template = await prisma.emailTemplate.findUnique({
      where: { slug: templateSlug }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 })
    }

    // Preparar dados do e-mail
    const emailData = {
      to: testEmail,
      subject: template.subject,
      html: template.body.replace(/\n/g, '<br>'),
      from: smtpConfig.from
    }

    // Enviar via API da Locaweb
    const response = await fetch('https://api.smtplw.com.br/v1/messages', {
      method: 'POST',
      headers: {
        'x-auth-token': smtpConfig.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Erro na API Locaweb:', errorData)
      return NextResponse.json({ 
        error: 'Erro ao enviar e-mail via Locaweb',
        details: errorData
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'E-mail de teste enviado com sucesso' 
    })

  } catch (error) {
    console.error('Erro ao enviar e-mail de teste:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 