import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Liberar fotos privadas para um usuário
export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { targetUserId, photoIds } = body;

    if (!targetUserId || !photoIds || !Array.isArray(photoIds)) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Verificar se o usuário logado tem fotos privadas
    const userPhotos = await prisma.photo.findMany({
      where: {
        id: { in: photoIds },
        userId: userId,
        isPrivate: true
      }
    });

    if (userPhotos.length === 0) {
      return NextResponse.json({ error: 'Nenhuma foto privada encontrada' }, { status: 404 });
    }

    // Criar ou atualizar permissões de acesso às fotos
    const photoReleases = await Promise.all(
      photoIds.map(async (photoId) => {
        return prisma.photoRelease.upsert({
          where: {
            photoId_targetUserId: {
              photoId: photoId,
              targetUserId: targetUserId
            }
          },
          update: {
            grantedAt: new Date()
          },
          create: {
            photoId: photoId,
            targetUserId: targetUserId,
            grantedAt: new Date()
          }
        });
      })
    );

    return NextResponse.json({
      message: 'Fotos liberadas com sucesso',
      releasedCount: photoReleases.length,
      photos: userPhotos.map(photo => ({
        id: photo.id,
        url: photo.url,
        isPrivate: photo.isPrivate
      }))
    });

  } catch (error) {
    console.error('Erro ao liberar fotos privadas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// GET - Verificar fotos liberadas para um usuário
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const { searchParams } = new URL(request.url);
  const targetUserId = searchParams.get('targetUserId');
  
  if (!userId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  if (!targetUserId) {
    return NextResponse.json({ error: 'ID do usuário alvo é obrigatório' }, { status: 400 });
  }

  try {
    // Buscar fotos liberadas para o usuário alvo
    const releasedPhotos = await prisma.photoRelease.findMany({
      where: {
        photo: {
          userId: userId
        },
        targetUserId: targetUserId
      },
      include: {
        photo: {
          select: {
            id: true,
            url: true,
            isPrivate: true,
            uploadedAt: true
          }
        }
      }
    });

    return NextResponse.json({
      releasedPhotos: releasedPhotos.map(release => ({
        id: release.photo.id,
        url: release.photo.url,
        isPrivate: release.photo.isPrivate,
        uploadedAt: release.photo.uploadedAt.toISOString(),
        grantedAt: release.grantedAt?.toISOString() || null
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar fotos liberadas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 