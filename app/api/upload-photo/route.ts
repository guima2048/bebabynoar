import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { isValidImageFile, sanitizeString } from '@/lib/validation';
import { uploadLimiter } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
    const { success } = await uploadLimiter.check(10, ip); // 10 uploads por minuto
    
    if (!success) {
      return NextResponse.json(
        { error: 'Muitos uploads. Tente novamente em 1 minuto.' },
        { status: 429 }
      );
    }

    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const isPrivate = formData.get('isPrivate') === 'true';
    
    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Validar arquivo usando utilitário de validação
    if (!isValidImageFile(file)) {
      return NextResponse.json(
        { error: 'Arquivo inválido. Use JPEG, PNG ou WebP com máximo 5MB.' },
        { status: 400 }
      );
    }

    // Validar tipo de upload
    if (!['profile', 'gallery'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de upload inválido' },
        { status: 400 }
      );
    }

    // Criar diretório de uploads se não existir
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Criar subdiretório por tipo se necessário
    const typeDir = join(uploadsDir, type);
    if (!existsSync(typeDir)) {
      await mkdir(typeDir, { recursive: true });
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    const filePath = join(typeDir, fileName);

    // Converter File para Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Salvar arquivo
    await writeFile(filePath, buffer);

    // URL relativa para o banco de dados
    const relativeUrl = `/uploads/${type}/${fileName}`;

    // Salvar no banco de dados
    const photo = await prisma.photo.create({
      data: {
        url: relativeUrl,
        isPrivate: isPrivate ?? false,
        userId: userId
      }
    });

    return NextResponse.json({ success: true, photo });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
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
        userId: userId
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
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 