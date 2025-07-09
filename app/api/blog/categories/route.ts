import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validação para criação de categorias
const createCategorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome muito longo'),
  description: z.string().max(200, 'Descrição muito longa').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve ser um código hexadecimal válido').default('#EC4899'),
})

// Schema de validação para atualização de categorias
const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().min(1, 'ID é obrigatório'),
})

// Função para gerar slug único
async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  let slug = baseSlug
  let counter = 1

  while (true) {
    const existingCategory = await prisma.blogCategory.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } })
      }
    })

    if (!existingCategory) {
      break
    }

    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

// GET - Listar categorias
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parâmetros de busca
    const includePosts = searchParams.get('includePosts') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // Buscar categorias
    const categories = await prisma.blogCategory.findMany({
      orderBy: { name: 'asc' },
      take: limit,
    })

    // Formatar resposta
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      categories: formattedCategories
    })

  } catch (error) {
    console.error('❌ Erro ao buscar categorias:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova categoria
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createCategorySchema.parse(body)

    // Gerar slug único
    const slug = await generateUniqueSlug(validatedData.name)

    // Criar categoria
    const category = await prisma.blogCategory.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description || null,
        color: validatedData.color,
      }
    })

    console.log('✅ Categoria criada:', category.id)

    return NextResponse.json({
      success: true,
      category
    })

  } catch (error) {
    console.error('❌ Erro ao criar categoria:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar categoria
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateCategorySchema.parse(body)

    // Verificar se a categoria existe
    const existingCategory = await prisma.blogCategory.findUnique({
      where: { id: validatedData.id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Gerar slug único se o nome mudou
    let slug = existingCategory.slug
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      slug = await generateUniqueSlug(validatedData.name, validatedData.id)
    }

    // Preparar dados de atualização
    const updateData: any = {
      ...validatedData,
      slug,
      updatedAt: new Date(),
    }

    // Remover campos que não devem ser atualizados
    delete updateData.id

    // Atualizar categoria
    const updatedCategory = await prisma.blogCategory.update({
      where: { id: validatedData.id },
      data: updateData
    })

    console.log('✅ Categoria atualizada:', updatedCategory.id)

    return NextResponse.json({
      success: true,
      category: updatedCategory
    })

  } catch (error) {
    console.error('❌ Erro ao atualizar categoria:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar categoria
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('id')

    if (!categoryId) {
      return NextResponse.json(
        { error: 'ID da categoria é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se a categoria existe
    const existingCategory = await prisma.blogCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se há posts associados
    if (existingCategory._count.posts > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar uma categoria que possui posts associados' },
        { status: 400 }
      )
    }

    // Deletar categoria
    await prisma.blogCategory.delete({
      where: { id: categoryId }
    })

    console.log('✅ Categoria deletada:', categoryId)

    return NextResponse.json({
      success: true,
      message: 'Categoria deletada com sucesso'
    })

  } catch (error) {
    console.error('❌ Erro ao deletar categoria:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 