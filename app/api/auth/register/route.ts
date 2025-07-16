import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { authLimiter } from '@/lib/rate-limit'
import { EmailService } from '@/lib/email'
import crypto from 'crypto'

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
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown'
    const { success } = await authLimiter.check(3, ip) // 3 registros por 15 minutos
    
    if (!success) {
      return NextResponse.json(
        { message: 'Muitas tentativas de registro. Tente novamente em 15 minutos.' },
        { status: 429 }
      )
    }

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
    const userData: any = {
      email: validatedData.email,
      password: hashedPassword,
      username: validatedData.username,
      birthdate: new Date(validatedData.birthdate),
      gender: (genderMap[validatedData.gender] as any) || 'OTHER',
      userType: (userTypeMap[validatedData.userType] as any) || 'SUGAR_BABY',
      lookingFor: lookingFor as any,
      state: validatedData.state,
      city: validatedData.city,
    }

    // Adicionar campos opcionais apenas se existirem
    if (validatedData.location) userData.location = validatedData.location
    if (validatedData.about) userData.about = validatedData.about
    if (validatedData.height) userData.height = validatedData.height
    if (validatedData.weight) userData.weight = validatedData.weight
    if (validatedData.education) userData.education = validatedData.education
    if (validatedData.profession) userData.profession = validatedData.profession
    if (validatedData.hasChildren !== undefined) userData.hasChildren = validatedData.hasChildren
    if (validatedData.smokes !== undefined) userData.smokes = validatedData.smokes
    if (validatedData.drinks !== undefined) userData.drinks = validatedData.drinks
    if (validatedData.relationshipType) userData.relationshipType = validatedData.relationshipType
    if (validatedData.availableForTravel !== undefined) userData.availableForTravel = validatedData.availableForTravel
    if (validatedData.receiveTravelers !== undefined) userData.receiveTravelers = validatedData.receiveTravelers
    if (validatedData.social) userData.social = validatedData.social

    // Gerar token de verificação de e-mail
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    const user = await prisma.user.create({
      data: {
        ...userData,
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: tokenExpiry,
        lastVerificationEmailSent: new Date()
      }
    })

    // Verificar se o template de confirmação de e-mail está ativo
    const emailTemplate = await prisma.emailTemplate.findUnique({
      where: { slug: 'email-confirmation' }
    })

    if (emailTemplate && emailTemplate.enabled) {
      try {
        // Enviar e-mail de confirmação usando o EmailService
        const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`
        
        await EmailService.sendEmailConfirmation(
          user.email,
          user.name || user.username,
          verificationUrl
        )
      } catch (error) {
        console.error('Erro ao enviar e-mail de confirmação:', error)
        // Não falhar o registro se o e-mail não for enviado
      }
    }

    // Remover senha do response
    const { password, ...userWithoutPassword } = user
    return NextResponse.json(
      { 
        message: 'Usuário criado com sucesso. Verifique seu e-mail para confirmar a conta.',
        user: userWithoutPassword,
        emailVerificationRequired: emailTemplate?.enabled || false
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