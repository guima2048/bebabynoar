import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    
    // Parâmetros de busca
    const search = searchParams.get('search') || ''
    const userType = searchParams.get('userType') as 'SUGAR_BABY' | 'SUGAR_DADDY' | null
    const gender = searchParams.get('gender') as 'MALE' | 'FEMALE' | null
    const state = searchParams.get('state') || ''
    const city = searchParams.get('city') || ''
    const minAge = parseInt(searchParams.get('minAge') || '18')
    const maxAge = parseInt(searchParams.get('maxAge') || '100')
    const verified = searchParams.get('verified') === 'true'
    const premium = searchParams.get('premium') === 'true'
    
    // Paginação
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Calcular datas de nascimento para filtro de idade
    const today = new Date()
    const minDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate())
    const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate())

    // Construir filtros
    const where: any = {
      id: { not: session.user.id }, // Excluir usuário atual
      status: 'ACTIVE',
      birthdate: {
        gte: minDate,
        lte: maxDate
      }
    }

    // Filtro por tipo de usuário (o que está procurando)
    if (userType) {
      where.lookingFor = userType
    }

    // Filtro por gênero
    if (gender) {
      where.gender = gender
    }

    // Filtro por localização
    if (state) {
      where.state = state
    }
    if (city) {
      where.city = city
    }

    // Filtro por verificação
    if (verified) {
      where.verified = true
    }

    // Filtro por premium
    if (premium) {
      where.premium = true
    }

    // Busca por texto (nome, username, about)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { about: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Buscar usuários
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        username: true,
        birthdate: true,
        gender: true,
        userType: true,
        state: true,
        city: true,
        about: true,
        photoURL: true,
        verified: true,
        premium: true,
        premiumExpiry: true,
        photos: {
          where: { isPrivate: false },
          select: { url: true },
          take: 1
        },
        _count: {
          select: {
            photos: {
              where: { isPrivate: false }
            }
          }
        }
      },
      orderBy: [
        { premium: 'desc' },
        { verified: 'desc' },
        { lastActive: 'desc' }
      ],
      take: limit,
      skip: offset
    })

    // Contar total de resultados
    const total = await prisma.user.count({ where })

    // Calcular idade e formatar dados
    const formattedUsers = users.map(user => {
      const age = today.getFullYear() - user.birthdate.getFullYear()
      const monthDiff = today.getMonth() - user.birthdate.getMonth()
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < user.birthdate.getDate()) 
        ? age - 1 
        : age

      return {
        ...user,
        age: actualAge,
        photoCount: user._count.photos,
        mainPhoto: user.photoURL || user.photos[0]?.url,
        photos: undefined, // Remover array de fotos
        _count: undefined // Remover contador
      }
    })

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
    })

  } catch (error) {
    console.error('❌ Erro ao buscar usuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 