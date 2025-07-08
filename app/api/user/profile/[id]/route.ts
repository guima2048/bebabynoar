import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const userId = params.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        birthdate: true,
        gender: true,
        userType: true,
        lookingFor: true,
        state: true,
        city: true,
        location: true,
        about: true,
        photoURL: true,
        verified: true,
        premium: true,
        premiumExpiry: true,
        status: true,
        height: true,
        weight: true,
        education: true,
        profession: true,
        hasChildren: true,
        smokes: true,
        drinks: true,
        relationshipType: true,
        availableForTravel: true,
        receiveTravelers: true,
        social: true,
        createdAt: true,
        updatedAt: true,
        lastActive: true,
        isAdmin: true,
        photos: {
          select: {
            id: true,
            url: true,
            fileName: true,
            isPrivate: true,
            uploadedAt: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se o usuário está editando seu próprio perfil
    if (session.user.id !== params.id) {
      return NextResponse.json(
        { message: 'Não autorizado para editar este perfil' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: body,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        birthdate: true,
        gender: true,
        userType: true,
        lookingFor: true,
        state: true,
        city: true,
        location: true,
        about: true,
        photoURL: true,
        verified: true,
        premium: true,
        premiumExpiry: true,
        status: true,
        height: true,
        weight: true,
        education: true,
        profession: true,
        hasChildren: true,
        smokes: true,
        drinks: true,
        relationshipType: true,
        availableForTravel: true,
        receiveTravelers: true,
        social: true,
        createdAt: true,
        updatedAt: true,
        lastActive: true,
        isAdmin: true,
      }
    })

    return NextResponse.json({
      message: 'Perfil atualizado com sucesso',
      user: updatedUser
    })
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 