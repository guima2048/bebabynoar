import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 NextAuth authorize called with:', { email: credentials?.email })
        }
        
        if (!credentials?.email || !credentials?.password) {
          if (process.env.NODE_ENV === 'development') {
            console.log('❌ Missing credentials')
          }
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user) {
          if (process.env.NODE_ENV === 'development') {
            console.log('❌ User not found:', credentials.email)
          }
          return null
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ User found:', { id: user.id, email: user.email })
        }

        // Verificar se o usuário tem senha definida
        if (!user.password) {
          if (process.env.NODE_ENV === 'development') {
            console.log('❌ User has no password - require password reset')
          }
          return null // Não permitir login sem senha
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          if (process.env.NODE_ENV === 'development') {
            console.log('❌ Invalid password for user:', credentials.email)
          }
          return null
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Password valid, returning user data')
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name || user.username,
          image: user.photoURL ?? '',
          userType: user.userType,
          premium: user.premium,
          verified: user.verified,
          isAdmin: user.isAdmin
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 JWT callback:', { token: token.sub, user: user?.email })
      }
      if (user) {
        token.userType = user.userType
        token.premium = user.premium
        token.verified = user.verified
        token.isAdmin = user.isAdmin
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ JWT updated with user data')
        }
      }
      return token
    },
    async session({ session, token }) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Session callback - Token completo:', JSON.stringify(token, null, 2))
        console.log('🔄 Session callback - Token sub:', token.sub)
        console.log('🔄 Session callback - Session antes:', JSON.stringify(session, null, 2))
      }
      if (token) {
        session.user.id = token.sub!
        session.user.userType = token.userType
        session.user.premium = token.premium
        session.user.verified = token.verified
        session.user.isAdmin = token.isAdmin
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Session updated with token data')
          console.log('✅ Session final - user.id:', session.user.id)
          console.log('✅ Session final completa:', JSON.stringify(session, null, 2))
        }
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  debug: process.env.NODE_ENV === 'development'
} 