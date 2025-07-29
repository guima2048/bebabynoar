import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    if (!username || !password) {
      return NextResponse.json({ error: 'Usuário e senha obrigatórios' }, { status: 400 })
    }
    // Busca usuário pelo username OU email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username }
        ]
      },
    })
    if (!user) {
      return NextResponse.json({ error: 'Usuário ou senha inválidos' }, { status: 401 })
    }
    // Verificação de senha com bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password || '')
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Usuário ou senha inválidos' }, { status: 401 })
    }
    // Retorna dados do usuário (remova campos sensíveis)
    const { password: _, ...userData } = user
    return NextResponse.json({ user: userData })
  } catch (error) {
    return NextResponse.json({ error: 'Erro no login' }, { status: 500 })
  }
} 