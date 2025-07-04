import { NextRequest, NextResponse } from 'next/server';
import { getAdminStorage } from '@/lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const storage = getAdminStorage();
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
    const seoFriendlyName = `blog-${timestamp}-${uuidv4()}.${extension}`;
    
    // Organizar por ano/mês para melhor performance
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const storagePath = `blog-images/${year}/${month}/${seoFriendlyName}`;

    // Converter File para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload para Firebase Storage (Admin SDK)
    const fileRef = storage.file(storagePath);
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          uploadedAt: new Date().toISOString(),
          originalName: file.name,
          fileSize: file.size.toString(),
          type: 'blog-image',
          alt: originalName.replace(/[^a-zA-Z0-9]/g, ' ').trim(),
          description: `Imagem do blog - ${originalName}`,
        }
      },
      public: true,
      validation: false
    });

    // Gerar URL pública (corrigido)
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${storage.name}/o/${encodeURIComponent(storagePath)}?alt=media`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: seoFriendlyName,
      originalName: file.name,
      size: file.size,
      type: file.type,
      message: 'Imagem enviada com sucesso'
    });

  } catch (error) {
    console.error('Erro no upload de imagem do blog:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: (error instanceof Error ? error.stack : String(error)) },
      { status: 500 }
    );
  }
} 