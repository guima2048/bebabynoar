import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Interfaces TypeScript
interface BlockData {
  id: string
  userId: string
  targetUserId: string
  reason: string
  createdAt: Date
  userType: string
  targetUserType: string
}

interface UserData {
  name?: string
  email: string
  userType: string
  age?: number
  location?: string
  bio?: string
  photos?: string[]
  isPremium?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { userId, targetUserId, reason } = await request.json()

    if (!userId || !targetUserId) {
      return NextResponse.json({ error: 'ID do usuário e ID do alvo são obrigatórios' }, { status: 400 })
    }

    if (userId === targetUserId) {
      return NextResponse.json({ error: 'Não é possível bloquear a si mesmo' }, { status: 400 })
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Verificar se o alvo existe
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    })
    
    if (!targetUser) {
      return NextResponse.json({ error: 'Usuário alvo não encontrado' }, { status: 404 })
    }

    // Verificar se já está bloqueado
    const existingBlock = await prisma.block.findUnique({
      where: {
        userId_targetUserId: {
          userId,
          targetUserId
        }
      }
    })
    
    if (existingBlock) {
      return NextResponse.json({ error: 'Usuário já está bloqueado' }, { status: 400 })
    }

    // Adicionar bloqueio
    await prisma.block.create({
      data: {
        userId,
        targetUserId,
        reason: reason || 'Bloqueio solicitado pelo usuário',
        userType: user.userType,
        targetUserType: targetUser.userType,
      }
    })

    // Remover de favoritos se existir
    await prisma.favorite.deleteMany({
      where: {
        OR: [
          { userId, targetUserId },
          { userId: targetUserId, targetUserId: userId }
        ]
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Usuário bloqueado com sucesso' 
    })

  } catch (error) {
    console.error('Erro ao bloquear usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, targetUserId } = await request.json()

    if (!userId || !targetUserId) {
      return NextResponse.json({ error: 'ID do usuário e ID do alvo são obrigatórios' }, { status: 400 })
    }

    // Remover bloqueio
    const block = await prisma.block.findUnique({
      where: {
        userId_targetUserId: {
          userId,
          targetUserId
        }
      }
    })
    
    if (!block) {
      return NextResponse.json({ error: 'Usuário não está bloqueado' }, { status: 404 })
    }

    await prisma.block.delete({
      where: {
        userId_targetUserId: {
          userId,
          targetUserId
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Usuário desbloqueado com sucesso' 
    })

  } catch (error) {
    console.error('Erro ao desbloquear usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
    }

    // Buscar usuários bloqueados
    const blocks = await prisma.block.findMany({
      where: { userId },
      include: {
        targetUser: {
          select: {
            id: true,
            name: true,
            email: true,
            userType: true,
            location: true,
            photos: true,
            premium: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Formatar dados dos usuários bloqueados
    const blockedUsers = blocks.map(block => ({
      id: block.id,
      userId: block.userId,
      targetUserId: block.targetUserId,
      reason: block.reason,
      createdAt: block.createdAt,
      userType: block.userType,
      targetUserType: block.targetUserType,
      targetUser: {
        id: block.targetUser.id,
        name: block.targetUser.name || 'Usuário',
        email: block.targetUser.email,
        userType: block.targetUser.userType,
        location: block.targetUser.location,
        photos: block.targetUser.photos || [],
        isPremium: block.targetUser.premium || false,
      }
    }))

    return NextResponse.json({
      blockedUsers,
      count: blockedUsers.length,
    })

  } catch (error) {
    console.error('Erro ao buscar usuários bloqueados:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 