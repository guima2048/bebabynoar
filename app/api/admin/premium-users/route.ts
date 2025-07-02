import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    // Verificar se é uma requisição administrativa
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se o Firebase está inicializado
    if (!db) {
      return NextResponse.json({ error: 'Firebase não inicializado' }, { status: 500 });
    }

    // Buscar usuários do Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const users = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email || '',
        name: data.name || data.displayName || 'Usuário',
        isPremium: data.isPremium || false,
        premiumExpiry: data.premiumExpiry || null,
        createdAt: data.createdAt?.toDate?.() || new Date(),
      };
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Erro ao buscar usuários premium:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 