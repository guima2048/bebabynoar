import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Autenticação admin
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Parâmetros de busca
    const search = searchParams.get('search') || '';
    const userType = searchParams.get('userType') || '';
    const status = searchParams.get('status') || '';
    const premium = searchParams.get('premium') || '';
    const verified = searchParams.get('verified') || '';
    const state = searchParams.get('state') || '';
    const city = searchParams.get('city') || '';
    
    // Paginação
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    // Busca por texto
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filtro por tipo de usuário
    if (userType && userType !== 'all') {
      where.userType = userType;
    }

    // Filtro por status
    if (status && status !== 'all') {
      if (status === 'active') {
        where.status = 'ACTIVE';
      } else if (status === 'blocked') {
        where.status = 'BLOCKED';
      }
    }

    // Filtro por premium
    if (premium && premium !== 'all') {
      where.premium = premium === 'true';
    }

    // Filtro por verificação
    if (verified && verified !== 'all') {
      where.verified = verified === 'true';
    }

    // Filtro por localização
    if (state) {
      where.state = state;
    }
    if (city) {
      where.city = city;
    }

    // Buscar usuários
    const users = await prisma.user.findMany({
      where,
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
        verified: true,
        lastActive: true,
        isAdmin: true,
        emailVerified: true,
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
      },
      take: limit,
      skip: offset
    });

    // Contar total de resultados
    const total = await prisma.user.count({ where });

    // Formatar dados
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

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 