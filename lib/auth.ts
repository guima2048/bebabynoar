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
        console.log('🔐 NextAuth authorize called with:', { email: credentials?.email })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user) {
          console.log('❌ User not found:', credentials.email)
          return null
        }

        console.log('✅ User found:', { id: user.id, email: user.email })

        // Para compatibilidade com dados existentes, verificar se tem senha hash
        // Se não tiver, criar uma senha temporária
        if (!user.password) {
          console.log('⚠️ User has no password, creating temporary one')
          // Se não tem senha, criar uma hash temporária
          const hashedPassword = await bcrypt.hash('temp123', 12)
          await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
          })
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password || ''
        )

        if (!isPasswordValid) {
          console.log('❌ Invalid password for user:', credentials.email)
          return null
        }

        console.log('✅ Password valid, returning user data')
        return {
          id: user.id,
          email: user.email,
          name: user.name || user.username,
          image: user.photoURL ?? undefined,
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
      console.log('🔄 JWT callback:', { token: token.sub, user: user?.email })
      if (user) {
        token.userType = user.userType
        token.premium = user.premium
        token.verified = user.verified
        token.isAdmin = user.isAdmin
        console.log('✅ JWT updated with user data')
      }
      return token
    },
    async session({ session, token }) {
      console.log('🔄 Session callback:', { session: session.user?.email, token: token.sub })
      if (token) {
        session.user.id = token.sub!
        session.user.userType = token.userType
        session.user.premium = token.premium
        session.user.verified = token.verified
        session.user.isAdmin = token.isAdmin
        console.log('✅ Session updated with token data')
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
} 