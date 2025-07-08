import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  // Autenticação admin
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  if (!adminSession || adminSession.value !== 'authenticated') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  // Por enquanto, retornar array vazio
  // TODO: Implementar busca de histórico de redes sociais no Prisma
  return NextResponse.json({ history: [] });
} 