import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    if (!username || !password) {
      return NextResponse.json({ error: 'Usuário e senha são obrigatórios' }, { status: 400 })
    }

    const adminUser = await prisma.user.findFirst({
      where: {
        username: { equals: username, mode: 'insensitive' },
        isAdmin: true
      }
    })

    if (!adminUser || !adminUser.password) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, adminUser.password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    // Login bem-sucedido - definir cookie
    const cookieStore = await cookies()
    cookieStore.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 dias
    })

    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: adminUser.id,
        username: adminUser.username,
        name: adminUser.name
      }
    })

  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 