import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validação para criação de comentários
const createCommentSchema = z.object({
  postId: z.string().min(1, 'ID do post é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório').max(1000, 'Comentário muito longo'),
})

// Schema de validação para atualização de comentários
const updateCommentSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório').max(1000, 'Comentário muito longo'),
})

// Schema de validação para moderação
const moderateCommentSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SPAM']),
})

// GET - Listar comentários de um post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parâmetros de busca
    const postId = searchParams.get('postId')
    const status = searchParams.get('status') as 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM' | null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    if (!postId) {
      return NextResponse.json(
        { error: 'ID do post é obrigatório' },
        { status: 400 }
      )
    }

    const offset = (page - 1) * limit

    // Construir filtros
    const where: any = { postId }
    
    if (status) {
      where.status = status
    } else {
      // Por padrão, mostrar apenas comentários aprovados
      where.status = 'APPROVED'
    }

    // Buscar comentários
    const [comments, total] = await Promise.all([
      prisma.blogComment.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.blogComment.count({ where })
    ])

    // Formatar resposta
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      status: comment.status,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: comment.user,
    }))

    return NextResponse.json({
      success: true,
      comments: formattedComments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      }
    })

  } catch (error) {
    console.error('❌ Erro ao buscar comentários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo comentário
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createCommentSchema.parse(body)

    // Verificar se o post existe
    const post = await prisma.blogPost.findUnique({
      where: { id: validatedData.postId },
      select: { id: true, status: true }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o post está publicado
    if (post.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Não é possível comentar em posts não publicados' },
        { status: 400 }
      )
    }

    // Definir status inicial do comentário
    const initialStatus = session.user.isAdmin ? 'APPROVED' : 'PENDING'

    // Criar comentário
    const comment = await prisma.blogComment.create({
      data: {
        content: validatedData.content,
        status: initialStatus,
        postId: validatedData.postId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            photoURL: true,
          }
        }
      }
    })

    console.log('✅ Comentário criado:', comment.id)

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        content: comment.content,
        status: comment.status,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: comment.user,
      }
    })

  } catch (error) {
    console.error('❌ Erro ao criar comentário:', error)
    
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

// PUT - Atualizar comentário
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateCommentSchema.parse(body)

    // Verificar se o comentário existe
    const existingComment = await prisma.blogComment.findUnique({
      where: { id: validatedData.id },
      include: { user: true }
    })

    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comentário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário é o autor ou admin
    if (existingComment.userId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      )
    }

    // Atualizar comentário
    const updatedComment = await prisma.blogComment.update({
      where: { id: validatedData.id },
      data: {
        content: validatedData.content,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            photoURL: true,
          }
        }
      }
    })

    console.log('✅ Comentário atualizado:', updatedComment.id)

    return NextResponse.json({
      success: true,
      comment: {
        id: updatedComment.id,
        content: updatedComment.content,
        status: updatedComment.status,
        createdAt: updatedComment.createdAt,
        updatedAt: updatedComment.updatedAt,
        author: updatedComment.user,
      }
    })

  } catch (error) {
    console.error('❌ Erro ao atualizar comentário:', error)
    
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

// PATCH - Moderar comentário (apenas admin)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = moderateCommentSchema.parse(body)

    // Verificar se o comentário existe
    const existingComment = await prisma.blogComment.findUnique({
      where: { id: validatedData.id }
    })

    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comentário não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar status do comentário
    const updatedComment = await prisma.blogComment.update({
      where: { id: validatedData.id },
      data: {
        status: validatedData.status,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            photoURL: true,
          }
        }
      }
    })

    console.log('✅ Comentário moderado:', updatedComment.id, 'Status:', validatedData.status)

    return NextResponse.json({
      success: true,
      comment: {
        id: updatedComment.id,
        content: updatedComment.content,
        status: updatedComment.status,
        createdAt: updatedComment.createdAt,
        updatedAt: updatedComment.updatedAt,
        author: updatedComment.user,
      }
    })

  } catch (error) {
    console.error('❌ Erro ao moderar comentário:', error)
    
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

// DELETE - Deletar comentário
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('id')

    if (!commentId) {
      return NextResponse.json(
        { error: 'ID do comentário é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o comentário existe
    const existingComment = await prisma.blogComment.findUnique({
      where: { id: commentId },
      include: { user: true }
    })

    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comentário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário é o autor ou admin
    if (existingComment.userId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      )
    }

    // Deletar comentário
    await prisma.blogComment.delete({
      where: { id: commentId }
    })

    console.log('✅ Comentário deletado:', commentId)

    return NextResponse.json({
      success: true,
      message: 'Comentário deletado com sucesso'
    })

  } catch (error) {
    console.error('❌ Erro ao deletar comentário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 