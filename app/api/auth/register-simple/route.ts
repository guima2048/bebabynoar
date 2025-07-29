import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const simpleRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3),
  birthdate: z.string(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  userType: z.enum(['SUGAR_BABY', 'SUGAR_DADDY', 'SUGAR_MOMMY']),
  lookingFor: z.enum(['SUGAR_BABY', 'SUGAR_DADDY', 'SUGAR_MOMMY']).optional(),
  state: z.string(),
  city: z.string(),
  about: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = simpleRegisterSchema.parse(body)

    // Verificar se email já existe
    const existingEmail = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingEmail) {
      return NextResponse.json(
       { message: 'Email já está em uso' },
        { status:400 }
      )
    }

    // Verificar se username já existe
    const existingUsername = await prisma.user.findUnique({
      where: { username: validatedData.username }
    })

    if (existingUsername) {
      return NextResponse.json(
      { message: 'Nome de usuário já está em uso' },
        { status:400 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        username: validatedData.username,
        birthdate: new Date(validatedData.birthdate),
        gender: validatedData.gender,
        userType: validatedData.userType,
        lookingFor: validatedData.lookingFor ?? null,
        state: validatedData.state,
        city: validatedData.city,
        about: validatedData.about ?? null,
        emailVerified: true, // Email já verificado
      }
    })

    // Remover senha do response
    const { password, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        message: 'Usuário criado com sucesso!',
        user: userWithoutPassword
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Erro no registro:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status:400 }
      )
    }

    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 } 
    )
  }
} 