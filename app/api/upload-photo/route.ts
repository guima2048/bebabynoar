import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const isPrivate = formData.get('isPrivate') === 'true';

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.' },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 5MB.' },
        { status: 400 }
      );
    }

    // Criar diretório de uploads se não existir
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Converter File para Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Salvar arquivo
    await writeFile(filePath, buffer);

    // Salvar no banco de dados
    const photo = await prisma.photo.create({
      data: {
        url: `/uploads/${fileName}`,
        fileName: fileName,
        isPrivate: isPrivate,
        userId: session.user.id
      }
    });

    console.log('✅ Foto salva:', photo.url);

    return NextResponse.json({
      success: true,
      photo: {
        id: photo.id,
        url: photo.url,
        fileName: photo.fileName,
        isPrivate: photo.isPrivate
      }
    });
  } catch (error) {
    console.error('❌ Erro no upload:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('photoId');

    if (!photoId) {
      return NextResponse.json(
        { message: 'ID da foto é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a foto pertence ao usuário
    const photo = await prisma.photo.findFirst({
      where: {
        id: photoId,
        userId: session.user.id
      }
    });

    if (!photo) {
      return NextResponse.json(
        { message: 'Foto não encontrada' },
        { status: 404 }
      );
    }

    // Deletar arquivo físico
    const { unlink } = await import('fs/promises');
    const { join } = await import('path');
    const filePath = join(process.cwd(), 'public', photo.url);
    
    try {
      await unlink(filePath);
    } catch (error) {
      console.error('Erro ao deletar arquivo físico:', error);
      // Continuar mesmo se não conseguir deletar o arquivo físico
    }

    // Deletar do banco
    await prisma.photo.delete({
      where: { id: photoId }
    });

    return NextResponse.json({
      message: 'Foto deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar foto:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 