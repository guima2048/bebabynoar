import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, getDocs, query, where, orderBy } from 'firebase/firestore'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    
    let q = query(collection(db, 'blog'), orderBy('createdAt', 'desc'))
    
    if (status && status !== 'all') {
      q = query(q, where('status', '==', status))
    }
    
    const snapshot = await getDocs(q)
    
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json(posts)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('Iniciando criação de post...')
    const { title, content, excerpt, status } = await req.json()
    
    console.log('Dados recebidos:', { title, content: content?.substring(0, 100) + '...', excerpt, status })
    
    if (!title || !content) {
      console.log('Dados obrigatórios faltando:', { title: !!title, content: !!content })
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

    console.log('Slug gerado:', slug)

    const postData = {
      title,
      slug,
      content,
      excerpt: excerpt || '',
      status: status || 'draft',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      publishedAt: status === 'published' ? serverTimestamp() : null,
    }

    console.log('Dados do post preparados:', postData)

    console.log('Tentando salvar no Firestore...')
    const docRef = await addDoc(collection(db, 'blog'), postData)
    console.log('Post salvo com sucesso, ID:', docRef.id)
    
    return NextResponse.json({
      id: docRef.id,
      ...postData
    })

  } catch (error) {
    console.error('Erro detalhado ao criar post:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, title, content, excerpt, slug, featuredImage, metaTitle, metaDescription, status, publishedAt } = await req.json()
    
    if (!id || !title || !content || !slug) {
      return NextResponse.json({ error: 'ID, título, conteúdo e slug são obrigatórios' }, { status: 400 })
    }

    // Calcula tempo de leitura
    const wordCount = content.split(/\s+/).length
    const readTime = Math.ceil(wordCount / 200)

    const updateData = {
      title,
      content,
      excerpt: excerpt || content.substring(0, 160) + '...',
      slug,
      featuredImage,
      metaTitle,
      metaDescription,
      status,
      readTime,
      updatedAt: serverTimestamp(),
      ...(status === 'published' && { publishedAt: publishedAt || new Date().toISOString() })
    }

    await updateDoc(doc(db, 'blog', id), updateData)
    
    return NextResponse.json({ 
      success: true,
      message: 'Post atualizado com sucesso!'
    })
  } catch (err) {
    console.error('Erro ao atualizar post:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    
    if (!id) {
      return NextResponse.json({ error: 'ID do post é obrigatório' }, { status: 400 })
    }

    await deleteDoc(doc(db, 'blog', id))
    
    return NextResponse.json({ 
      success: true,
      message: 'Post excluído com sucesso!'
    })
  } catch (err) {
    console.error('Erro ao excluir post:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
} 