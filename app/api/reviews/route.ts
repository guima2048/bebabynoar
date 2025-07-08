import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Listar reviews de um usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('targetUserId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

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

    // Buscar reviews do usuário
    const reviews = await prisma.review.findMany({
      where: {
        targetUserId: targetUserId,
        status: 'APPROVED' // Apenas reviews aprovados
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            username: true,
            photoURL: true,
            userType: true,
            verified: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    });

    // Contar total de reviews
    const total = await prisma.review.count({
      where: {
        targetUserId: targetUserId,
        status: 'APPROVED'
      }
    });

    // Calcular média das avaliações
    const averageRating = await prisma.review.aggregate({
      where: {
        targetUserId: targetUserId,
        status: 'APPROVED'
      },
      _avg: {
        rating: true
      }
    });

    return NextResponse.json({
      reviews: reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        reviewer: review.reviewer,
        createdAt: review.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      averageRating: averageRating._avg.rating || 0
    });
  } catch (error) {
    console.error('Erro ao buscar reviews:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar um novo review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { targetUserId, rating, comment } = await request.json();

    if (!targetUserId || !rating) {
      return NextResponse.json(
        { error: 'ID do usuário e avaliação são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar rating (1-5)
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Avaliação deve ser entre 1 e 5' },
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

    // Verificar se não está tentando avaliar a si mesmo
    if (session.user.id === targetUserId) {
      return NextResponse.json(
        { error: 'Não é possível avaliar a si mesmo' },
        { status: 400 }
      );
    }

    // Verificar se já existe um review do mesmo usuário
    const existingReview = await prisma.review.findFirst({
      where: {
        reviewerId: session.user.id,
        targetUserId: targetUserId
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'Você já avaliou este usuário' },
        { status: 400 }
      );
    }

    // Criar o review
    const review = await prisma.review.create({
      data: {
        reviewerId: session.user.id,
        targetUserId: targetUserId,
        rating: rating,
        comment: comment || '',
        status: 'PENDING' // Aguardando aprovação
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            username: true,
            photoURL: true,
            userType: true,
            verified: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        reviewer: review.reviewer,
        status: review.status,
        createdAt: review.createdAt
      },
      message: 'Review enviado com sucesso e aguardando aprovação'
    });
  } catch (error) {
    console.error('Erro ao criar review:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 