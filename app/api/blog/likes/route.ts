import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validação
const toggleLikeSchema = z.object({
  postId: z.string().min(1, 'ID do post é obrigatório'),
})

// POST - Toggle like/unlike
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
    const validatedData = toggleLikeSchema.parse(body)

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
        { error: 'Não é possível curtir posts não publicados' },
        { status: 400 }
      )
    }

    // Verificar se o usuário já deu like
    const existingLike = await prisma.blogLike.findFirst({
      where: {
        postId: validatedData.postId,
        userId: session.user.id
      }
    })

    if (existingLike) {
      // Remover like
      await prisma.blogLike.delete({
        where: {
          postId_userId: {
            postId: validatedData.postId,
            userId: session.user.id
          }
        }
      })

      // Decrementar contador
      await prisma.blogPost.update({
        where: { id: validatedData.postId },
        data: {
          likesCount: {
            decrement: 1
          }
        }
      })

      console.log('✅ Like removido:', validatedData.postId)

      return NextResponse.json({
        success: true,
        liked: false,
        message: 'Like removido com sucesso'
      })

    } else {
      // Adicionar like
      await prisma.blogLike.create({
        data: {
          postId: validatedData.postId,
          userId: session.user.id,
        }
      })

      // Incrementar contador
      await prisma.blogPost.update({
        where: { id: validatedData.postId },
        data: {
          likesCount: {
            increment: 1
          }
        }
      })

      console.log('✅ Like adicionado:', validatedData.postId)

      return NextResponse.json({
        success: true,
        liked: true,
        message: 'Post curtido com sucesso'
      })
    }

  } catch (error) {
    console.error('❌ Erro ao toggle like:', error)
    
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

// GET - Verificar se usuário deu like
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json(
        { error: 'ID do post é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o usuário deu like
    const like = await prisma.blogLike.findFirst({
      where: {
        postId,
        userId: session.user.id
      }
    })

    return NextResponse.json({
      success: true,
      liked: !!like
    })

  } catch (error) {
    console.error('❌ Erro ao verificar like:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 