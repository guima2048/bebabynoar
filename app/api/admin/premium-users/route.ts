import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔐 Premium Users: Verificando autenticação...')
    
    // Autenticação admin
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    
    console.log('🔐 Premium Users: Cookie encontrado:', adminSession ? 'Sim' : 'Não')
    if (adminSession) {
      console.log('🔐 Premium Users: Valor do cookie:', adminSession.value)
    }
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      console.log('❌ Premium Users: Não autorizado')
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    console.log('✅ Premium Users: Autenticado, buscando usuários...')

    // Buscar todos os usuários do banco de dados
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        userType: true,
        birthdate: true,
        city: true,
        state: true,
        status: true,
        premium: true,
        premiumExpiry: true,
        createdAt: true,
        lookingFor: true,
        // Campos adicionais que podem ser úteis para admin
        verified: true,
        lastActive: true,
        isAdmin: true,
        emailVerified: true,
        // Relacionamentos
        photos: {
          select: {
            url: true,
            isPrivate: true
          }
        },
        _count: {
          select: {
            photos: true,
            sentMessages: true,
            receivedMessages: true,
            sentInterests: true,
            receivedInterests: true,
            sentReports: true,
            receivedReports: true,
            profileViews: true,
            viewedProfiles: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formatar dados para a interface
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      userType: user.userType,
      birthdate: user.birthdate.toISOString(),
      city: user.city,
      state: user.state,
      ativo: user.status === 'ACTIVE',
      premium: user.premium,
      createdAt: user.createdAt.toISOString(),
      lookingFor: user.lookingFor,
      verified: user.verified,
      lastActive: user.lastActive.toISOString(),
      isAdmin: user.isAdmin,
      emailVerified: user.emailVerified,
      premiumExpiry: user.premiumExpiry?.toISOString(),
      photoCount: user._count.photos,
      messageCount: user._count.sentMessages + user._count.receivedMessages,
      interestCount: user._count.sentInterests + user._count.receivedInterests,
      reportCount: user._count.sentReports + user._count.receivedReports,
      profileViewCount: user._count.profileViews,
      viewedByCount: user._count.viewedProfiles,
      mainPhoto: user.photos.find(p => !p.isPrivate)?.url || null
    }));

    console.log('✅ Premium Users: Retornando', formattedUsers.length, 'usuários')
    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error('❌ Premium Users: Erro ao buscar usuários:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 