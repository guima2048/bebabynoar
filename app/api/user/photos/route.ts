import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const { searchParams } = new URL(request.url);
  const isPrivate = searchParams.get('private');
  
  if (!userId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  try {
    const whereClause: any = {
      userId: userId
    };

    // Filtrar por fotos privadas se especificado
    if (isPrivate === 'true') {
      whereClause.isPrivate = true;
    }

    const photos = await prisma.photo.findMany({
      where: whereClause,
      orderBy: {
        uploadedAt: 'desc'
      }
    });

    return NextResponse.json({
      photos: photos.map(photo => ({
        id: photo.id,
        url: photo.url,
        isPrivate: photo.isPrivate,
        uploadedAt: photo.uploadedAt.toISOString(),
        status: photo.status
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar fotos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 