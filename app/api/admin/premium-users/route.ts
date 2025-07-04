import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Verificar se é uma requisição administrativa
    const cookieStore = cookies();
    const adminSession = cookieStore.get('admin_session');
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar usuários do Firestore
    const db = getAdminFirestore();
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.orderBy('createdAt', 'desc').get();

    const users = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        username: data.username || '',
        email: data.email || '',
        name: data.name || data.displayName || 'Usuário',
        userType: data.userType || 'sugar_baby',
        isPremium: data.isPremium || false,
        premium: data.premium || false,
        premiumExpiry: data.premiumExpiry || null,
        premiumDaysLeft: data.premiumDaysLeft || 0,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        signupIp: data.signupIp || '',
        ipLocation: data.ipLocation || '',
        lastLoginIp: data.lastLoginIp || '',
        lastLoginIpLocation: data.lastLoginIpLocation || '',
        lastLoginAt: data.lastLoginAt?.toDate?.() || null,
        city: data.city || '',
        state: data.state || '',
        ativo: data.ativo !== undefined ? data.ativo : true,
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