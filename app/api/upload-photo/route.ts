import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, getAdminStorage } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const photoType = formData.get('photoType') as string || 'public';

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Arquivo e ID do usuário são obrigatórios' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    const bucket = getAdminStorage();

    // Verificar se o usuário existe
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Gerar nome único para o arquivo
    const fileExtension = file.name.split('.').pop();
    const fileName = `users/${userId}/photos/${Date.now()}.${fileExtension}`;

    // Converter File para Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload para o Firebase Storage
    const fileUpload = bucket.file(fileName);
    await fileUpload.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // Gerar URL pública
    const [url] = await fileUpload.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // URL válida por muito tempo
    });

    // Salvar referência no Firestore
    const photoData = {
      url,
      fileName,
      type: photoType,
      uploadedAt: new Date(),
      userId,
    };

    const photoRef = await db.collection('photos').add(photoData);

    return NextResponse.json({
      success: true,
      photoId: photoRef.id,
      url,
      message: 'Foto enviada com sucesso',
    });

  } catch (error) {
    console.error('Erro ao fazer upload da foto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = getAdminFirestore()
    const storage = getAdminStorage()
    const { userId, photoUrl } = await request.json();

    if (!userId || !photoUrl) {
      return NextResponse.json(
        { error: 'ID do usuário e URL da foto são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    if (!userData) {
      return NextResponse.json(
        { error: 'Dados do usuário não encontrados' },
        { status: 404 }
      );
    }

    // Deletar do Storage
    try {
      const photoRef = storage.file(photoUrl);
      await photoRef.delete();
    } catch (error) {
      console.warn('Erro ao deletar foto do storage:', error);
    }

    // Remover da lista de fotos do usuário
    const photos = userData.photos || [];
    const updatedPhotos = photos.filter((photo: string) => photo !== photoUrl);

    const updateData = {
      photos: updatedPhotos,
      lastPhotoUpdate: new Date(),
    };

    await userRef.update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Foto deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar foto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 