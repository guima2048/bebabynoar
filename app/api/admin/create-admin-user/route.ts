import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    // Verifica autenticação admin pelo cookie
    const cookie = req.cookies.get('admin_session')
    if (!cookie || cookie.value !== 'authenticated') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { name, username, email, password } = await req.json()
    if (!name || !username || !email || !password) {
      return NextResponse.json({ error: 'Preencha todos os campos' }, { status: 400 })
    }

    // Verifica se já existe
    const exists = await prisma.user.findFirst({
      where: { OR: [ { username }, { email } ] }
    })
    if (exists) {
      return NextResponse.json({ error: 'Usuário ou email já cadastrado' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        isAdmin: true,
        verified: true,
        emailVerified: true,
        birthdate: new Date('1990-01-01'),
        gender: 'OTHER',
        userType: 'SUGAR_BABY',
        state: 'SP',
        city: 'São Paulo',
        status: 'ACTIVE'
      }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar admin' }, { status: 500 })
  }
} 