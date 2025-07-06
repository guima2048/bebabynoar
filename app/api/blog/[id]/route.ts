import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Tipagem correta para contexto de rota dinâmico no Next.js 15
interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const docSnap = await prisma.blogPost.findUnique({
      where: { id }
    })
    
    if (!docSnap) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 })
    }
    
    return NextResponse.json(docSnap)
  } catch (error) {
    console.error('Erro ao buscar post:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const { title, content, excerpt, status } = await req.json()
    
    if (!title || !content) {
      return NextResponse.json({ error: 'Título e conteúdo são obrigatórios' }, { status: 400 })
    }

    // Gerar slug a partir do título
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    const updateData: any = {
      title,
      slug,
      content,
      excerpt: excerpt || '',
      status,
      updatedAt: new Date(),
    }
    if (status === 'published') {
      updateData.publishedAt = new Date();
    }

    const docSnap = await prisma.blogPost.update({
      where: { id },
      data: updateData
    })
    
    return NextResponse.json(docSnap)

  } catch (error) {
    console.error('Erro ao atualizar post:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    await prisma.blogPost.delete({
      where: { id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Post excluído com sucesso'
    })

  } catch (error) {
    console.error('Erro ao excluir post:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 