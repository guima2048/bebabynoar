import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Verificar se é uma requisição administrativa
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Por enquanto, retornar arrays vazios
    // TODO: Implementar busca de fotos/textos pendentes quando o modelo existir no Prisma
    return NextResponse.json({
      photos: [],
      texts: []
    });

  } catch (error) {
    console.error('Erro ao buscar conteúdo pendente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 