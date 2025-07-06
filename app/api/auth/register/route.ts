import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3),
  birthdate: z.string(),
  gender: z.string(),
  userType: z.string(),
  lookingFor: z.string().optional(),
  state: z.string(),
  city: z.string(),
  location: z.string().optional(),
  about: z.string().optional(),
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
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Mapear enums do frontend para o formato do Prisma
    const genderMap: Record<string, string> = {
      male: 'MALE',
      female: 'FEMALE',
      other: 'OTHER',
      MALE: 'MALE',
      FEMALE: 'FEMALE',
      OTHER: 'OTHER',
    }
    const userTypeMap: Record<string, string> = {
      sugar_baby: 'SUGAR_BABY',
      sugar_daddy: 'SUGAR_DADDY',
      sugar_mommy: 'SUGAR_MOMMY',
      sugar_babyboy: 'SUGAR_BABYBOY',
      SUGAR_BABY: 'SUGAR_BABY',
      SUGAR_DADDY: 'SUGAR_DADDY',
      SUGAR_MOMMY: 'SUGAR_MOMMY',
      SUGAR_BABYBOY: 'SUGAR_BABYBOY',
    }
    // lookingFor pode ser userType ou male/female/both
    let lookingFor = validatedData.lookingFor
    if (lookingFor === 'male') lookingFor = 'SUGAR_DADDY'
    if (lookingFor === 'female') lookingFor = 'SUGAR_BABY'
    if (lookingFor === 'both') lookingFor = undefined
    if (lookingFor && userTypeMap[lookingFor]) lookingFor = userTypeMap[lookingFor]

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email já está em uso' },
        { status: 400 }
      )
    }
    // Verificar se username já existe
    const existingUsername = await prisma.user.findUnique({
      where: { username: validatedData.username }
    })
    if (existingUsername) {
      return NextResponse.json(
        { message: 'Nome de usuário já está em uso' },
        { status: 400 }
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
        gender: (genderMap[validatedData.gender] as any) || 'OTHER',
        userType: (userTypeMap[validatedData.userType] as any) || 'SUGAR_BABY',
        lookingFor: lookingFor as any,
        state: validatedData.state,
        city: validatedData.city,
        location: validatedData.location,
        about: validatedData.about,
        height: validatedData.height,
        weight: validatedData.weight,
        education: validatedData.education,
        profession: validatedData.profession,
        hasChildren: validatedData.hasChildren,
        smokes: validatedData.smokes,
        drinks: validatedData.drinks,
        relationshipType: validatedData.relationshipType,
        availableForTravel: validatedData.availableForTravel,
        receiveTravelers: validatedData.receiveTravelers,
        social: validatedData.social,
      }
    })
    // Remover senha do response
    const { password, ...userWithoutPassword } = user
    return NextResponse.json(
      { 
        message: 'Usuário criado com sucesso',
        user: userWithoutPassword 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro no registro:', error)
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