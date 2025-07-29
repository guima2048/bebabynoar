import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  }
  try {
    // Busca visualizações reais do banco
    const views = await prisma.profileView.findMany({
      where: { viewedId: userId },
      orderBy: { viewedAt: 'desc' },
      include: {
        viewer: {
          select: {
            id: true,
            username: true,
            photoURL: true,
            city: true,
            state: true
          }
        }
      }
    });
    const viewers = views.map((v) => ({
      id: v.viewer.id,
      username: v.viewer.username,
      name: v.viewer.username || v.viewer.id,
      photoURL: v.viewer.photoURL || '',
      city: v.viewer.city || '',
      state: v.viewer.state || '',
      viewedAt: v.viewedAt.toISOString(),
    }));
    return NextResponse.json({ viewers });
  } catch (e) {
    return NextResponse.json({ message: 'Erro ao buscar visualizações.' }, { status: 500 });
  }
} 