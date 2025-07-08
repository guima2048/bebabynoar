import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  // Autenticação admin
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  if (!adminSession || adminSession.value !== 'authenticated') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  // Por enquanto, retornar objeto vazio
  // TODO: Implementar busca de features premium no Prisma
  return NextResponse.json({ features: {} });
}

export async function POST() {
  // Autenticação admin
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  if (!adminSession || adminSession.value !== 'authenticated') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  // Por enquanto, apenas retornar sucesso
  // TODO: Implementar atualização de features premium no Prisma
  return NextResponse.json({ success: true });
} 