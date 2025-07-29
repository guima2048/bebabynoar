import { NextAuthOptions, DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credenciais',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] Credenciais não fornecidas', credentials);
          return null
        }

        try {
          // Buscar usuário por email ou username
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: credentials.email.toLowerCase() },
                { username: credentials.email.toLowerCase() }
              ],
              status: 'ACTIVE' // Apenas usuários ativos
            }
          })

          if (!user || !user.password) {
            console.log('[AUTH] Usuário não encontrado ou sem senha', credentials.email);
            return null
          }

          // Verificar senha
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          if (!isPasswordValid) {
            console.log('[AUTH] Senha inválida para', credentials.email);
            return null
          }

          // Verificar se email foi verificado (com fallback para campo verified)
          const isEmailVerified = !!user.emailVerified
          if (!isEmailVerified) {
            console.log('[AUTH] Email não verificado para', credentials.email);
            throw new Error('Você precisa confirmar seu email antes de acessar o sistema.')
          }

          // Atualizar último acesso
          await prisma.user.update({
            where: { id: user.id },
            data: { lastActive: new Date() }
          })

          // Retornar dados do usuário (sem senha)
          console.log('[AUTH] Login bem-sucedido para', credentials.email);
          return {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.username, // Usar username como nome
            image: user.photoURL,
            userType: user.userType,
            isAdmin: user.isAdmin,
            premium: user.premium,
            emailVerified: !!user.emailVerified
          }
        } catch (error) {
          console.error('[AUTH] Erro na autenticação:', error)
          if (error instanceof Error && error.message.includes('confirmar seu email')) {
            throw error
          }
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.userType = user.userType
        token.isAdmin = user.isAdmin
        token.premium = user.premium
        token.emailVerified = !!user.emailVerified
      }
      return token
    },
    async session({ session, token }) {
      console.log('[AUTH] Callback session', { session, token });
      if (token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.userType = token.userType as string
        session.user.isAdmin = token.isAdmin as boolean
        session.user.premium = token.premium as boolean
        session.user.emailVerified = token.emailVerified as boolean
      }
      return session
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  secret: (() => {
    if (!process.env.NEXTAUTH_SECRET) {
      throw new Error('NEXTAUTH_SECRET não definida nas variáveis de ambiente!');
    }
    return process.env.NEXTAUTH_SECRET;
  })(),
  debug: process.env.NODE_ENV === 'development',
}

// Tipos para TypeScript
declare module 'next-auth' {
  interface User {
    id: string
    username: string
    userType: string
    isAdmin: boolean
    premium: boolean
    emailVerified: boolean
  }

  interface Session {
    user: {
      id: string
      username: string
      userType: string
      isAdmin: boolean
      premium: boolean
      emailVerified: boolean
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
    userType: string
    isAdmin: boolean
    premium: boolean
    emailVerified: boolean
  }
} 