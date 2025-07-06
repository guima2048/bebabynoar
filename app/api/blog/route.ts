import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    
    // Buscar todos os posts (published e scheduled)
    const snapshot = await prisma.blogPost.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    const now = Date.now();
    let posts = snapshot.map((post: any) => ({
      id: post.id,
      ...post
    }))

    // Se status for published, incluir agendados cuja data já passou
    if (status === 'published') {
      posts = posts.filter((post: any) => {
        if (post.status === 'published') {
          return true;
        }
        if (post.status === 'scheduled' && post.scheduledFor && post.scheduledFor.seconds) {
          return (post.scheduledFor.seconds * 1000) <= now;
        }
        return false;
      });
    } else if (status && status !== 'all') {
      posts = posts.filter((post: any) => post.status === status);
    }

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
    const { title, content, excerpt, status, scheduledFor, featuredImage } = await req.json()
    if (!title || !content) {
      return NextResponse.json({ error: 'Título e conteúdo são obrigatórios' }, { status: 400 })
    }
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    // Validação de unicidade do slug
    const slugSnap = await prisma.blogPost.findMany({
      where: {
        slug: slug
      }
    });
    if (slugSnap.length > 0) {
      return NextResponse.json({ error: 'Já existe um post com esse slug.' }, { status: 400 });
    }
    // Validação de status
    const validStatus = ['published', 'draft', 'scheduled'];
    if (status && !validStatus.includes(status)) {
      return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
    }
    // Validação de data de publicação
    if (status === 'published' && scheduledFor) {
      const pubDate = new Date(scheduledFor);
      const now = new Date();
      if (isNaN(pubDate.getTime()) || pubDate > now) {
        return NextResponse.json({ error: 'Data de publicação inválida.' }, { status: 400 });
      }
    }
    const postData: any = {
      title,
      slug,
      content,
      excerpt: excerpt || '',
      status: status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      readTime: Math.ceil(content.split(/\s+/).length / 200),
      author: 'Admin',
      tags: [],
      featuredImage: featuredImage || '',
    }
    if (status === 'published') {
      postData.publishedAt = new Date();
    } else if (status === 'scheduled' && scheduledFor) {
      postData.scheduledFor = scheduledFor;
    }
    const docRef = await prisma.blogPost.create({
      data: postData
    })
    return NextResponse.json({ id: docRef.id, ...postData })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, title, content, excerpt, slug, featuredImage, metaTitle, metaDescription, status, publishedAt, scheduledFor } = await req.json()
    if (!id || !title || !content || !slug) {
      return NextResponse.json({ error: 'ID, título, conteúdo e slug são obrigatórios' }, { status: 400 })
    }
    const wordCount = content.split(/\s+/).length
    const readTime = Math.ceil(wordCount / 200)
    const updateData: any = {
      title,
      content,
      excerpt: excerpt || content.substring(0, 160) + '...',
      slug,
      featuredImage,
      metaTitle,
      metaDescription,
      status,
      readTime,
      updatedAt: new Date(),
      tags: [],
    }
    if (status === 'published') {
      updateData.publishedAt = new Date();
      updateData.scheduledFor = null;
    } else if (status === 'scheduled' && scheduledFor) {
      updateData.scheduledFor = scheduledFor;
      updateData.publishedAt = null;
    }
    const docRef = await prisma.blogPost.update({
      where: {
        id: id
      },
      data: updateData
    })
    return NextResponse.json({ success: true, message: 'Post atualizado com sucesso!' })
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    
    if (!id) {
      return NextResponse.json({ error: 'ID do post é obrigatório' }, { status: 400 })
    }

    await prisma.blogPost.delete({
      where: {
        id: id
      }
    })
    
    return NextResponse.json({ 
      success: true,
      message: 'Post excluído com sucesso!'
    })
  } catch (err) {
    console.error('Erro ao excluir post:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
} 