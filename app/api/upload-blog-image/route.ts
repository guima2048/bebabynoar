import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function POST(request: NextRequest) {
  try {
    if (!storage) {
      return NextResponse.json({ error: 'Erro de configuração do storage' }, { status: 500 });
    }
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não fornecido' }, { status: 400 });
    }

    // Validações
    const maxSize = 10 * 1024 * 1024; // 10MB para imagens de blog
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 10MB.' }, { status: 400 });
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de arquivo não suportado. Use JPG, PNG, WebP ou GIF.' }, { status: 400 });
    }

    // Criar nome único e otimizado para SEO
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const extension = originalName.split('.').pop() || 'jpg';
    const seoFriendlyName = `blog-${timestamp}.${extension}`;
    
    // Organizar por ano/mês para melhor performance
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const storageRef = ref(storage, `blog-images/${year}/${month}/${seoFriendlyName}`);

    // Converter File para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload para Firebase Storage com metadados otimizados
    const snapshot = await uploadBytes(storageRef, buffer, {
      contentType: file.type,
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        originalName: file.name,
        fileSize: file.size.toString(),
        type: 'blog-image',
        // Metadados para SEO
        alt: originalName.replace(/[^a-zA-Z0-9]/g, ' ').trim(),
        description: `Imagem do blog - ${originalName}`,
      }
    });

    // Obter URL de download
    const downloadURL = await getDownloadURL(snapshot.ref);

    return NextResponse.json({
      success: true,
      url: downloadURL,
      fileName: seoFriendlyName,
      originalName: file.name,
      size: file.size,
      type: file.type,
      message: 'Imagem enviada com sucesso'
    });

  } catch (error) {
    console.error('Erro no upload de imagem do blog:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 