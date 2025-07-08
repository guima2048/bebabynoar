import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Listar favoritos do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Buscar favoritos do usuário
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        targetUser: {
          select: {
            id: true,
            name: true,
            username: true,
            photoURL: true,
            birthdate: true,
            city: true,
            state: true,
            verified: true,
            premium: true,
            userType: true,
            lastActive: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    });

    // Contar total de favoritos
    const total = await prisma.favorite.count({
      where: {
        userId: session.user.id
      }
    });

    return NextResponse.json({
      favorites: favorites.map(fav => ({
        id: fav.id,
        targetUser: {
          ...fav.targetUser,
          age: fav.targetUser.birthdate ? Math.floor((Date.now() - new Date(fav.targetUser.birthdate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null
        },
        createdAt: fav.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Adicionar usuário aos favoritos
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { targetUserId } = await request.json();

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o usuário alvo existe
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se não está tentando favoritar a si mesmo
    if (session.user.id === targetUserId) {
      return NextResponse.json(
        { error: 'Não é possível favoritar a si mesmo' },
        { status: 400 }
      );
    }

    // Verificar se já é favorito
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_targetUserId: {
          userId: session.user.id,
          targetUserId: targetUserId
        }
      }
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Usuário já está nos favoritos' },
        { status: 400 }
      );
    }

    // Adicionar aos favoritos
    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        targetUserId: targetUserId
      },
      include: {
        targetUser: {
          select: {
            id: true,
            name: true,
            username: true,
            photoURL: true,
            birthdate: true,
            city: true,
            state: true,
            verified: true,
            premium: true,
            userType: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      favorite: {
        id: favorite.id,
        targetUser: {
          ...favorite.targetUser,
          age: favorite.targetUser.birthdate ? Math.floor((Date.now() - new Date(favorite.targetUser.birthdate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null
        },
        createdAt: favorite.createdAt
      }
    });
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Remover usuário dos favoritos
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('targetUserId');

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    // Remover dos favoritos
    const deletedFavorite = await prisma.favorite.deleteMany({
      where: {
        userId: session.user.id,
        targetUserId: targetUserId
      }
    });

    if (deletedFavorite.count === 0) {
      return NextResponse.json(
        { error: 'Usuário não está nos favoritos' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Usuário removido dos favoritos'
    });
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 