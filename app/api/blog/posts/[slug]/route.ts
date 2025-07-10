import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function slugify(str: string) {
  return str
    .normalize('NFD').replace(/\u0300-\u036f/g, '') // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET - Buscar post por slug ou ID
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const session = await getServerSession(authOptions)
    
    // Determinar se é slug ou ID - IDs do Prisma têm 25 caracteres alfanuméricos
    const isId = /^[a-zA-Z0-9]{25}$/.test(slug)
    
    const where = isId ? { id: slug } : { slug }
    
    // Buscar post
    const post = await prisma.blogPost.findFirst({
      where: {
        ...where,
        OR: [
          { status: 'PUBLISHED' },
          { status: 'SCHEDULED', scheduledFor: { lte: new Date() } },
          // Permitir visualização de rascunhos apenas para o autor ou admin
          ...(session?.user?.id ? [
            { 
              status: 'DRAFT' as const, 
              authorId: session.user.id 
            },
            ...(session.user.isAdmin ? [{ status: 'DRAFT' as const }] : [])
          ] : [])
        ]
      },
      include: {
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
          include: {
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
          include: {
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
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

            // Registrar visualização se o usuário não for o autor
        if (session?.user?.id && session.user.id !== post.authorId) {
          try {
            await prisma.blogView.create({
              data: {
                postId: post.id,
                userId: session.user.id,
                sessionId: session.user.id, // Usar userId como sessionId
                ipAddress: request.headers.get('x-forwarded-for') || 
                          request.headers.get('x-real-ip') || 
                          'unknown',
                userAgent: request.headers.get('user-agent') || 'unknown'
              }
            })

            // Atualizar contador de visualizações
            await prisma.blogPost.update({
              where: { id: post.id },
              data: {
                viewsCount: {
                  increment: 1
                }
              }
            })
          } catch (error) {
            console.error('Erro ao registrar visualização:', error)
            // Não falhar se não conseguir registrar a visualização
          }
        }

        // Verificar se o usuário atual deu like
        let userLiked = false
        if (session?.user?.id) {
          const like = await prisma.blogLike.findFirst({
            where: {
              postId: post.id,
              userId: session.user.id
            }
          })
          userLiked = !!like
        }

    // Formatar resposta
    const formattedPost = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      status: post.status,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      readTime: post.readTime,
      viewsCount: post.viewsCount,
      likesCount: post.likesCount,
      author: post.author,
      categories: post.categories.map(c => c.category),
      tags: post.tags,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      comments: post.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: comment.user,
      })),
      _count: post._count,
      userLiked,
    }

    return NextResponse.json({
      success: true,
      post: formattedPost
    })

  } catch (error) {
    console.error('❌ Erro ao buscar post:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar campos específicos do post
export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { slug } = params
    const body = await request.json()
    
    // Determinar se é slug ou ID - IDs do Prisma têm 25 caracteres alfanuméricos
    const isId = /^[a-zA-Z0-9]{25}$/.test(slug)
    const where = isId ? { id: slug } : { slug }

    // Verificar se o post existe e se o usuário é o autor
    const existingPost = await prisma.blogPost.findFirst({
      where,
      include: { author: true }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    if (existingPost.authorId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      )
    }

    // Atualizar apenas campos permitidos
    const allowedFields = ['status', 'scheduledFor', 'metaTitle', 'metaDescription']
    const updateData: any = {}
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo válido para atualizar' },
        { status: 400 }
      )
    }

    updateData.updatedAt = new Date()

    // Definir data de publicação se status mudou para PUBLISHED
    if (updateData.status === 'PUBLISHED' && existingPost.status !== 'PUBLISHED') {
      updateData.publishedAt = new Date()
      updateData.scheduledFor = null
    }

    if (body.title && body.title !== existingPost.title) {
      let baseSlug = slugify(body.title);
      let newSlug = baseSlug;
      let counter = 1;
      while (await prisma.blogPost.findUnique({ where: { slug: newSlug } })) {
        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      // Não permitir posts com o mesmo título
      const existingTitle = await prisma.blogPost.findFirst({ where: { title: body.title } });
      if (existingTitle) {
        return NextResponse.json({ error: 'Já existe um post com este título.' }, { status: 400 });
      }
      updateData.slug = newSlug;
      updateData.title = body.title;
    }

    // Atualizar post
    const updatedPost = await prisma.blogPost.update({
      where: { id: existingPost.id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            photoURL: true,
          }
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              }
            }
          }
        }
      }
    })

    console.log('✅ Post atualizado:', updatedPost.id)

    return NextResponse.json({
      success: true,
      post: {
        ...updatedPost,
        categories: updatedPost.categories.map(c => c.category)
      }
    })

  } catch (error) {
    console.error('❌ Erro ao atualizar post:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 

// DELETE - Deletar post por ID ou slug (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Autenticação admin (NextAuth OU cookie admin_session)
    let isAdmin = false;
    // Tenta NextAuth
    const session = await getServerSession(authOptions)
    if (session?.user?.isAdmin) isAdmin = true;
    // Tenta cookie admin_session
    const adminSession = request.cookies.get('admin_session');
    if (adminSession && adminSession.value === 'authenticated') isAdmin = true;
    if (!isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 401 })
    }

    const { slug } = params
    // Permitir tanto por ID quanto por slug
    const isId = /^[a-zA-Z0-9]{25}$/.test(slug)
    const where = isId ? { id: slug } : { slug }

    // Buscar post
    const post = await prisma.blogPost.findFirst({ where })
    if (!post) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 })
    }

    // Deletar comentários
    await prisma.blogComment.deleteMany({ where: { postId: post.id } })
    // Deletar likes
    await prisma.blogLike.deleteMany({ where: { postId: post.id } })
    // Deletar views
    await prisma.blogView.deleteMany({ where: { postId: post.id } })
    // Deletar categorias
    await prisma.blogPostCategory.deleteMany({ where: { postId: post.id } })
    // Deletar imagens relacionadas (referências)
    await prisma.blogImage.deleteMany({ where: { postId: post.id } })
    // Deletar referências de uploads (se houver)
    // await prisma.blogImageUpload.deleteMany({ where: { postId: post.id } })

    // Se houver imagem no disco, remover arquivo (opcional, depende do seu storage)
    // Aqui só removemos do banco, não do disco

    // Deletar o post
    await prisma.blogPost.delete({ where: { id: post.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Erro ao deletar post:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 