import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    // Autenticação admin
    const cookieStore = cookies();
    const adminSession = cookieStore.get('admin_session');
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const db = getAdminFirestore();
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log('🔍 Buscando usuários com termo:', searchTerm);

    // Buscar todos os usuários
    const usersSnapshot = await db.collection('users').limit(limit).get();
    
    if (usersSnapshot.empty) {
      return NextResponse.json({ users: [], total: 0 });
    }

    const users: any[] = [];
    let foundTonyy = false;

    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      const userId = doc.id;
      
      // Campos de nome possíveis
      const username = userData.username || '';
      const name = userData.name || '';
      const displayName = userData.displayName || '';
      const email = userData.email || '';
      
      // Verificar se é o usuário TONYY
      const isTonyy = username.toLowerCase() === 'tonyy' || 
                     name.toLowerCase() === 'tonyy' || 
                     displayName.toLowerCase() === 'tonyy';
      
      if (isTonyy) {
        foundTonyy = true;
        console.log('🎯 USUÁRIO TONYY ENCONTRADO!');
        console.log('ID:', userId);
        console.log('Username:', username);
        console.log('Name:', name);
        console.log('DisplayName:', displayName);
        console.log('Email:', email);
      }
      
      // Filtrar por termo de busca se fornecido
      const matchesSearch = !searchTerm || 
        username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase());

      if (matchesSearch) {
        users.push({
          id: userId,
          username,
          name,
          displayName,
          email,
          userType: userData.userType || '',
          premium: userData.premium || false,
          isPremium: userData.isPremium || false,
          ativo: userData.ativo !== false,
          createdAt: userData.createdAt,
          city: userData.city || '',
          state: userData.state || '',
          isTonyy // Marcar se é o TONYY
        });
      }
    });

    // Ordenar: TONYY primeiro, depois por nome
    users.sort((a, b) => {
      if (a.isTonyy && !b.isTonyy) return -1;
      if (!a.isTonyy && b.isTonyy) return 1;
      return (a.name || a.username || '').localeCompare(b.name || b.username || '');
    });

    console.log(`📊 Total de usuários encontrados: ${users.length}`);
    if (foundTonyy) {
      console.log('✅ Usuário TONYY foi encontrado e destacado!');
    } else {
      console.log('❌ Usuário TONYY não foi encontrado.');
    }

    return NextResponse.json({
      users,
      total: users.length,
      foundTonyy
    });

  } catch (error) {
    console.error('❌ Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: String(error) },
      { status: 500 }
    );
  }
} 