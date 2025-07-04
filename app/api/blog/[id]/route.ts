import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getAdminFirestore()
    const docSnap = await db.collection('blog').doc(params.id).get()
    
    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 })
    }
    
    return NextResponse.json({
      id: docSnap.id,
      ...docSnap.data()
    })
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
  { params }: { params: { id: string } }
) {
  try {
    const db = getAdminFirestore()
    const { title, content, excerpt, status } = await req.json()
    
    if (!title || !content) {
      return NextResponse.json({ error: 'Título e conteúdo são obrigatórios' }, { status: 400 })
    }

    // Gerar slug a partir do título
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
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

    await db.collection('blog').doc(params.id).update(updateData)
    
    return NextResponse.json({
      id: params.id,
      ...updateData
    })

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
  { params }: { params: { id: string } }
) {
  try {
    const db = getAdminFirestore()
    await db.collection('blog').doc(params.id).delete()
    
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