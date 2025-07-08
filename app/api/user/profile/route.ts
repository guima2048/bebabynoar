import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const profileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  about: z.string().optional(),
  photoURL: z.string().url().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  education: z.string().optional(),
  profession: z.string().optional(),
  hasChildren: z.boolean().optional(),
  smokes: z.boolean().optional(),
  drinks: z.boolean().optional(),
  relationshipType: z.string().optional(),
  availableForTravel: z.boolean().optional(),
  receiveTravelers: z.boolean().optional(),
  social: z.record(z.any()).optional(),
  location: z.string().optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = profileUpdateSchema.parse(body)

    // Converter undefined para null em todos os campos opcionais
    const sanitizedData = Object.fromEntries(
      Object.entries(validatedData).map(([k, v]) => [k, v === undefined ? null : v])
    )

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: sanitizedData,
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
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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