import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'

function isId(param: string) {
  // Ajuste conforme o padrão do seu ID (exemplo: cuid do Prisma)
  return /^[a-zA-Z0-9]{25}$/.test(param)
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const param = params.id
    const where = isId(param) ? { id: param } : { slug: param }
    const post = await prisma.blogPost.findFirst({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        featuredImage: true,
        featuredImageAlt: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        readTime: true,
        viewsCount: true,
        likesCount: true,
        tags: true,
        metaTitle: true,
        metaDescription: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            photoURL: true,
            about: true,
          }
        },
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              }
            }
          }
        },
        comments: {
          where: { status: 'APPROVED' },
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                photoURL: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            comments: true,
            likes: true,
            views: true,
          }
        },
      },
    })
    if (!post) {
      return NextResponse.json({ error: 'Post não encontrado.' }, { status: 404 })
    }
    // Verificar se o usuário atual deu like (opcional, se necessário)
    // ...
    return NextResponse.json({ success: true, post })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminSession = req.cookies.get('admin_session')
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 401 })
    }

    const param = params.id
    const { title, content, excerpt, status, categoryIds, featuredImage, featuredImageAlt, metaTitle, metaDescription } = await req.json()

    if (!param || !title || !content) {
      return NextResponse.json({ error: 'ID/slug, título e conteúdo são obrigatórios' }, { status: 400 })
    }

    // Buscar o post por ID ou slug
    const where = isId(param) ? { id: param } : { slug: param }
    const existingPost = await prisma.blogPost.findFirst({ where })
    if (!existingPost) {
      return NextResponse.json({ error: 'Post não encontrado.' }, { status: 404 })
    }

    // Se o título mudou, verificar se já existe outro post com esse título
    if (title !== existingPost.title) {
      const titleConflict = await prisma.blogPost.findFirst({ where: { title, id: { not: existingPost.id } } })
      if (titleConflict) {
        return NextResponse.json({ error: 'Já existe um post com este título.' }, { status: 400 })
      }
    }

    // Atualizar slug se o título mudou
    let newSlug = existingPost.slug
    if (title !== existingPost.title) {
      let baseSlug = slugify(title)
      let slug = baseSlug
      let counter = 1
      while (await prisma.blogPost.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }
      newSlug = slug
    }

    const updated = await prisma.blogPost.update({
      where: { id: existingPost.id },
      data: {
        title,
        content,
        excerpt: excerpt || content.substring(0, 200) + '...',
        slug: newSlug,
        status: status || existingPost.status,
        featuredImage,
        featuredImageAlt,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt || content.substring(0, 160),
        publishedAt: status === 'PUBLISHED' && !existingPost.publishedAt ? new Date() : existingPost.publishedAt,
      }
    })

    if (categoryIds) {
      await prisma.blogPostCategory.deleteMany({ where: { postId: existingPost.id } })
      if (categoryIds.length > 0) {
        await prisma.blogPostCategory.createMany({
          data: categoryIds.map((categoryId: string) => ({ postId: existingPost.id, categoryId }))
        })
      }
    }

    return NextResponse.json({ success: true, post: updated })
  } catch (error) {
    console.error('❌ Erro ao atualizar post:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 