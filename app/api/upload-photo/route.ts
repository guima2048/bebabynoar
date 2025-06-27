import { NextRequest, NextResponse } from 'next/server';
import { storage, db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { photoUploadSchema, validateAndSanitize, createErrorResponse } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const type = formData.get('type') as 'profile' | 'gallery';

    if (!file || !userId || !type) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 });
    }

    // Validações
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5MB.' }, { status: 400 });
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de arquivo não suportado' }, { status: 400 });
    }

    // Verificar se o usuário existe
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Criar nome único para o arquivo
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storageRef = ref(storage, `users/${userId}/${type}/${fileName}`);

    // Converter File para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload para Firebase Storage
    const snapshot = await uploadBytes(storageRef, buffer, {
      contentType: file.type,
      customMetadata: {
        uploadedBy: userId,
        uploadedAt: new Date().toISOString(),
        originalName: file.name,
      }
    });

    // Obter URL de download
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Atualizar documento do usuário
    const updateData: any = {};
    
    if (type === 'profile') {
      // Remover foto de perfil anterior se existir
      const userData = userDoc.data();
      if (userData.profilePhoto) {
        try {
          const oldPhotoRef = ref(storage, userData.profilePhoto);
          await deleteObject(oldPhotoRef);
        } catch (error) {
          console.warn('Erro ao deletar foto anterior:', error);
        }
      }
      updateData.profilePhoto = downloadURL;
    } else if (type === 'gallery') {
      const userData = userDoc.data();
      const existingPhotos = userData.photos || [];
      updateData.photos = [...existingPhotos, downloadURL];
    }

    await updateDoc(userRef, {
      ...updateData,
      lastPhotoUpdate: new Date(),
    });

    return NextResponse.json({
      success: true,
      url: downloadURL,
      fileName: fileName,
      message: 'Foto enviada com sucesso'
    });

  } catch (error) {
    console.error('Erro no upload de foto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const photoUrl = searchParams.get('photoUrl');
    const type = searchParams.get('type') as 'profile' | 'gallery';

    if (!userId || !photoUrl || !type) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios faltando' }, { status: 400 });
    }

    // Verificar se o usuário existe
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Deletar do Storage
    try {
      const photoRef = ref(storage, photoUrl);
      await deleteObject(photoRef);
    } catch (error) {
      console.warn('Erro ao deletar foto do storage:', error);
    }

    // Atualizar documento do usuário
    const updateData: any = {};
    
    if (type === 'profile') {
      updateData.profilePhoto = null;
    } else if (type === 'gallery') {
      const userData = userDoc.data();
      const existingPhotos = userData.photos || [];
      updateData.photos = existingPhotos.filter((url: string) => url !== photoUrl);
    }

    await updateDoc(userRef, updateData);

    return NextResponse.json({
      success: true,
      message: 'Foto removida com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar foto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 