import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Função para buscar ou criar usuário admin
async function getAdminUserId(): Promise<string> {
  let adminUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'admin@bebaby.app' },
        { username: 'admin' }
      ]
    }
  })

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@bebaby.app',
        username: 'admin',
        name: 'Administrador',
        birthdate: new Date('1990-01-01'),
        gender: 'MALE',
        userType: 'SUGAR_DADDY',
        state: 'SP',
        city: 'São Paulo',
        isAdmin: true,
        verified: true,
        emailVerified: true
      }
    })
  }

  return adminUser.id
}

function slugify(str: string) {
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET - Listar posts (público e admin)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'PUBLISHED'
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const isAdmin = searchParams.get('admin') === 'true'

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    
    if (!isAdmin) {
      where.status = 'PUBLISHED'
    } else if (status !== 'ALL') {
      where.status = status
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category
          }
        }
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Buscar posts com relacionamentos
    const posts = await prisma.blogPost.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            photoURL: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        _count: {
          select: {
            views: true,
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      skip,
      take: limit
    })

    // Contar total para paginação
    const total = await prisma.blogPost.count({ where })

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('❌ Erro ao buscar posts:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo post (apenas admin)
export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação admin
    const adminSession = req.cookies.get('admin_session')
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 401 }
      )
    }

    const { title, content, excerpt, status, categoryIds, featuredImage, metaTitle, metaDescription } = await req.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Título e conteúdo são obrigatórios' },
        { status: 400 }
      )
    }

    // Gerar slug único a partir do título
    let baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    // Verificar se slug já existe
    while (await prisma.blogPost.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    // Não permitir posts com o mesmo título
    const existingTitle = await prisma.blogPost.findFirst({ where: { title } });
    if (existingTitle) {
      return NextResponse.json({ error: 'Já existe um post com este título.' }, { status: 400 });
    }

    // Criar post
    const post = await prisma.blogPost.create({
      data: {
        title,
        content,
        excerpt: excerpt || content.substring(0, 200) + '...',
        slug,
        status: status || 'DRAFT',
        featuredImage,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt || content.substring(0, 160),
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        authorId: await getAdminUserId() // Buscar ID do usuário admin
      }
    })

    // Adicionar categorias se fornecidas
    if (categoryIds && categoryIds.length > 0) {
      await prisma.blogPostCategory.createMany({
        data: categoryIds.map((categoryId: string) => ({
          postId: post.id,
          categoryId
        }))
      })
    }

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        categories: []
      }
    })

  } catch (error) {
    console.error('❌ Erro ao criar post:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 