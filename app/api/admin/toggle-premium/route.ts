import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { userId, premium } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    
    // Atualizar status premium do usuário
    await db.collection('users').doc(userId).update({
      premium: premium,
      updatedAt: new Date()
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