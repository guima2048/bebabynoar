import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest) {
  try {
    // Verificar se é uma requisição administrativa
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { contentId, contentType, action } = await req.json()
    
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

    if (contentType === 'photo') {
      // Atualizar status da foto
      const photo = await prisma.photo.findUnique({ where: { id: contentId } })
      if (!photo) {
        return NextResponse.json({ error: 'Foto não encontrada' }, { status: 404 })
      }
      await prisma.photo.update({
        where: { id: contentId },
        data: { status: action === 'approve' ? 'APPROVED' : 'REJECTED' }
      })
      return NextResponse.json({
        success: true,
        message: `Foto ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso`
      })
    }

    if (contentType === 'text') {
      // Atualizar status do texto pendente
      const pendingText = await prisma.pendingText.findUnique({ where: { id: contentId }, include: { user: true } })
      if (!pendingText) {
        return NextResponse.json({ error: 'Texto pendente não encontrado' }, { status: 404 })
      }
      await prisma.pendingText.update({
        where: { id: contentId },
        data: { status: action === 'approve' ? 'APPROVED' : 'REJECTED' }
      })
      // Se aprovado, copiar conteúdo para o campo do usuário
      if (action === 'approve') {
        const field = pendingText.field
        if (['about', 'lookingFor'].includes(field)) {
          await prisma.user.update({
            where: { id: pendingText.userId },
            data: { [field]: pendingText.content }
          })
        }
      }
      return NextResponse.json({
        success: true,
        message: `Texto ${action === 'approve' ? 'aprovado' : 'rejeitado'} com sucesso`
      })
    }

    return NextResponse.json({ error: 'Tipo de conteúdo não suportado' }, { status: 400 })

  } catch (error) {
    console.error('Erro na moderação de conteúdo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
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