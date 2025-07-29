import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Verificar se é uma requisição administrativa
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar fotos pendentes
    const photos = await prisma.photo.findMany({
      where: { status: 'PENDING' },
      include: { user: { select: { username: true } } },
      orderBy: { uploadedAt: 'desc' }
    });

    // Buscar textos pendentes
    const texts = await prisma.pendingText.findMany({
      where: { status: 'PENDING' },
      include: { user: { select: { username: true } } },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({
      photos: photos.map(photo => ({
        id: photo.id,
        userId: photo.userId,
        userName: photo.user?.username || '',
        photoURL: photo.url,
        uploadedAt: photo.uploadedAt,
        isPrivate: photo.isPrivate,
        status: photo.status
      })),
      texts: texts.map(text => ({
        id: text.id,
        userId: text.userId,
        userName: text.user?.username || '',
        field: text.field,
        content: text.content,
        updatedAt: text.updatedAt,
        status: text.status
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar conteúdo pendente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 