import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, updateDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = doc(db, 'blog', params.id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
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

    const updateData = {
      title,
      slug,
      content,
      excerpt: excerpt || '',
      status,
      updatedAt: serverTimestamp(),
      ...(status === 'published' && { publishedAt: serverTimestamp() })
    }

    const docRef = doc(db, 'blog', params.id)
    await updateDoc(docRef, updateData)
    
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
    const docRef = doc(db, 'blog', params.id)
    await deleteDoc(docRef)
    
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