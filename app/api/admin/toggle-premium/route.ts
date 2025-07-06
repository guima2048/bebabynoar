import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, premium } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    // Atualizar status premium do usuário usando Prisma
    await prisma.user.update({
      where: { id: userId },
      data: {
        premium: premium,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: `Usuário ${premium ? 'promovido' : 'rebaixado'} com sucesso`
    });

  } catch (error) {
    console.error('Erro ao alterar status premium:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 