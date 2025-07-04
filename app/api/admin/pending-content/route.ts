import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Verificar se é uma requisição administrativa
    const cookieStore = cookies();
    const adminSession = cookieStore.get('admin_session');
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const db = getAdminFirestore();

    // Buscar fotos pendentes
    const pendingPhotosRef = db.collection('pendingContent').where('type', '==', 'photo');
    const photosSnapshot = await pendingPhotosRef.get();

    const pendingPhotos = [];
    for (const doc of photosSnapshot.docs) {
      const photoData = doc.data();
      
      // Buscar informações do usuário
      const userRef = db.collection('users').doc(photoData.userId);
      const userDoc = await userRef.get();
      const userData = userDoc.exists ? userDoc.data() : {};

      pendingPhotos.push({
        id: doc.id,
        userId: photoData.userId,
        userName: (userData as any)?.name || (userData as any)?.displayName || 'Usuário',
        photoURL: photoData.photoURL || photoData.url,
        uploadedAt: photoData.createdAt?.toDate?.() || photoData.uploadedAt || new Date(),
        isPrivate: photoData.isPrivate || false,
        status: photoData.status || 'pending'
      });
    }

    // Buscar textos pendentes
    const pendingTextsRef = db.collection('pendingContent').where('type', '==', 'text');
    const textsSnapshot = await pendingTextsRef.get();

    const pendingTexts = [];
    for (const doc of textsSnapshot.docs) {
      const textData = doc.data();
      
      // Buscar informações do usuário
      const userRef = db.collection('users').doc(textData.userId);
      const userDoc = await userRef.get();
      const userData = userDoc.exists ? userDoc.data() : {};

      pendingTexts.push({
        id: doc.id,
        userId: textData.userId,
        userName: (userData as any)?.name || (userData as any)?.displayName || 'Usuário',
        field: textData.field || 'about',
        content: textData.content || textData.text,
        updatedAt: textData.updatedAt?.toDate?.() || textData.createdAt?.toDate?.() || new Date(),
        status: textData.status || 'pending'
      });
    }

    return NextResponse.json({
      photos: pendingPhotos,
      texts: pendingTexts
    });

  } catch (error) {
    console.error('Erro ao buscar conteúdo pendente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 