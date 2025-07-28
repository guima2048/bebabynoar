import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { canUsersSeeEachOther } from '@/lib/user-matching'

// GET - Listar favoritos do usuário
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'my-favorites';
    // Quem me favoritou
    if (type === 'favorited-by') {
      // Usuários que favoritaram o usuário logado
      const favorites = await prisma.favorite.findMany({
        where: { targetUserId: userId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              photoURL: true,
              userType: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({
        users: favorites.map(fav => fav.user)
      });
    }
    // Meus favoritos (padrão)
    if (type === 'my-favorites') {
      const favorites = await prisma.favorite.findMany({
        where: { userId: userId },
        include: {
          targetUser: {
            select: {
              id: true,
              username: true,
              photoURL: true,
              userType: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({
        users: favorites.map(fav => fav.targetUser)
      });
    }
    // fallback antigo (padrão)
    // ... código antigo pode ser mantido para compatibilidade ...
    return NextResponse.json({ users: [] });
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
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
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
    if (userId === targetUserId) {
      return NextResponse.json(
        { error: 'Não é possível favoritar a si mesmo' },
        { status: 400 }
      );
    }

    // Verificar se já é favorito
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_targetUserId: {
          userId: userId,
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
        userId: userId,
        targetUserId: targetUserId
      },
      include: {
        targetUser: {
          select: {
            id: true,
            username: true,
            photoURL: true,
            birthdate: true,
            city: true,
            state: true,
            premium: true,
            userType: true,
            gender: true, // Adicionado
            lookingFor: true, // Adicionado
            lastActive: true // Adicionado
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
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Suporte a targetUserId na query ou no body
    const { searchParams } = new URL(request.url);
    let targetUserId = searchParams.get('targetUserId');
    if (!targetUserId) {
      try {
        const body = await request.json();
        targetUserId = body.targetUserId;
      } catch {}
    }
    if (!targetUserId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    // Remover dos favoritos
    const deletedFavorite = await prisma.favorite.deleteMany({
      where: {
        userId: userId,
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