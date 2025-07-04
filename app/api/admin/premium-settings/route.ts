import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

const COLLECTION = 'premiumSettings';
const DOC_ID = 'features';

export async function GET(req: NextRequest) {
  // Autenticação admin
  const cookieStore = cookies();
  const adminSession = cookieStore.get('admin_session');
  if (!adminSession || adminSession.value !== 'authenticated') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  const db = getAdminFirestore();
  const docRef = db.collection(COLLECTION).doc(DOC_ID);
  const docSnap = await docRef.get();
  if (!docSnap.exists) {
    return NextResponse.json({ features: {} });
  }
  return NextResponse.json({ features: docSnap.data() });
}

export async function POST(req: NextRequest) {
  // Autenticação admin
  const cookieStore = cookies();
  const adminSession = cookieStore.get('admin_session');
  if (!adminSession || adminSession.value !== 'authenticated') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  const db = getAdminFirestore();
  const docRef = db.collection(COLLECTION).doc(DOC_ID);
  const body = await req.json();
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }
  await docRef.set(body, { merge: true });
  return NextResponse.json({ success: true });
} 