import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const profileUpdateSchema = z.object({
  about: z.string().optional(),
  photoURL: z.string().url().optional(),
  education: z.string().optional(),
  profession: z.string().optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }
    const body = await request.json()
    const validatedData = profileUpdateSchema.parse(body)
    const sanitizedData = Object.fromEntries(
      Object.entries(validatedData).map(([k, v]) => [k, v === undefined ? null : v])
    )
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: sanitizedData,
      select: {
        id: true,
        email: true,
        username: true,
        birthdate: true,
        gender: true,
        userType: true,
        lookingFor: true,
        state: true,
        city: true,
        about: true,
        photoURL: true,
        emailVerified: true,
        emailVerifiedAt: true,
        premium: true,
        premiumExpiry: true,
        status: true,
        education: true,
        profession: true,
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

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        birthdate: true,
        gender: true,
        userType: true,
        lookingFor: true,
        state: true,
        city: true,
        about: true,
        photoURL: true,
        emailVerified: true,
        emailVerifiedAt: true,
        premium: true,
        premiumExpiry: true,
        status: true,
        education: true,
        profession: true,
        createdAt: true,
        updatedAt: true,
        lastActive: true,
        isAdmin: true,
        photos: {
          select: {
            id: true,
            url: true,
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
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 