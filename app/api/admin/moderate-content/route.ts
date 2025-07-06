import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Função para enviar e-mail
async function sendEmail({ to, subject, htmlContent }: { to: string, subject: string, htmlContent: string }) {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY!,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Bebaby App', email: 'no-reply@bebaby.app' },
        to: [{ email: to }],
        subject,
        htmlContent
      })
    })

    if (!response.ok) {
      throw new Error('Erro ao enviar e-mail')
    }
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error)
    throw error
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Verificar se é uma requisição administrativa
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { contentId, contentType, action, adminNotes } = await req.json()
    
    if (!contentId || !contentType || !action) {
      return NextResponse.json({ 
        error: 'ID do conteúdo, tipo e ação são obrigatórios' 
      }, { status: 400 })
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ 
        error: 'Ação deve ser "approve" ou "reject"' 
      }, { status: 400 })
    }

    if (!['photo', 'text'].includes(contentType)) {
      return NextResponse.json({ 
        error: 'Tipo de conteúdo deve ser "photo" ou "text"' 
      }, { status: 400 })
    }

    // Por enquanto, retornar sucesso sem processar
    // TODO: Implementar sistema de moderação quando os modelos forem criados
    return NextResponse.json({
      success: true,
      message: `Conteúdo ${action === 'approve' ? 'aprovado' : 'rejeitado'} com sucesso`
    })

  } catch (error) {
    console.error('Erro na moderação de conteúdo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    // Verificar se é uma requisição administrativa
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Por enquanto, retornar array vazio
    // TODO: Implementar busca de conteúdo pendente quando os modelos forem criados
    return NextResponse.json({
      content: []
    });

  } catch (error) {
    console.error('Erro ao buscar conteúdo pendente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 