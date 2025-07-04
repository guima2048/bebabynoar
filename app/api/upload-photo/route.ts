import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, getAdminStorage } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('📸 [Upload] Iniciando upload de foto...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const isPrivate = formData.get('isPrivate') === 'true';

    console.log('📸 [Upload] Dados recebidos:', { 
      fileName: file?.name, 
      fileSize: file?.size, 
      userId, 
      isPrivate 
    });

    if (!file || !userId) {
      console.error('📸 [Upload] Dados obrigatórios não fornecidos');
      return NextResponse.json(
        { error: 'Arquivo e ID do usuário são obrigatórios' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    const bucket = getAdminStorage();

    if (!db || !bucket) {
      console.error('📸 [Upload] Erro de configuração do Firebase');
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      );
    }

    // Verificar se o usuário existe
    console.log('📸 [Upload] Verificando usuário:', userId);
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      console.error('📸 [Upload] Usuário não encontrado:', userId);
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Gerar nome único para o arquivo
    const fileExtension = file.name.split('.').pop();
    const fileName = `users/${userId}/photos/${Date.now()}.${fileExtension}`;
    console.log('📸 [Upload] Nome do arquivo:', fileName);

    // Converter File para Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('📸 [Upload] Buffer criado, tamanho:', buffer.length);

    // Upload para o Firebase Storage
    console.log('📸 [Upload] Fazendo upload para Storage...');
    const fileUpload = bucket.file(fileName);
    await fileUpload.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });
    console.log('📸 [Upload] Upload para Storage concluído');

    // Gerar URL pública
    console.log('📸 [Upload] Gerando URL pública...');
    const [url] = await fileUpload.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // URL válida por muito tempo
    });
    console.log('📸 [Upload] URL gerada:', url);

    // Salvar referência no Firestore
    const photoData = {
      id: `photo_${Date.now()}`,
      url,
      photoURL: url, // compatibilidade com admin
      fileName,
      isPrivate: isPrivate || false,
      uploadedAt: new Date(),
      userId,
    };

    console.log('📸 [Upload] Dados da foto:', photoData);

    // Adicionar ao array de fotos do usuário (como objeto, igual ao admin)
    const userRef = db.collection('users').doc(userId);
    const userDocData = userDoc.data() || {};
    const existingPhotos = Array.isArray(userDocData.photos) ? userDocData.photos : [];
    
    console.log('📸 [Upload] Fotos existentes:', existingPhotos.length);
    
    const updatedPhotos = [...existingPhotos, photoData];
    console.log('📸 [Upload] Array atualizado:', updatedPhotos.length, 'fotos');
    
    await userRef.update({ photos: updatedPhotos });
    console.log('📸 [Upload] Firestore atualizado com sucesso');

    return NextResponse.json({
      success: true,
      url,
      photo: photoData,
      message: 'Foto enviada com sucesso',
    });

  } catch (error) {
    console.error('📸 [Upload] Erro no upload:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: String(error) },
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
    const updatedPhotos = photos.filter((photo: any) => photo.url !== photoUrl);

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