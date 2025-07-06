import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      userType: string
      premium: boolean
      verified: boolean
      isAdmin: boolean
    }
  }

  interface User {
    id: string
    email: string
    name: string
    image?: string
    userType: string
    premium: boolean
    verified: boolean
    isAdmin: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userType: string
    premium: boolean
    verified: boolean
    isAdmin: boolean
  }
} 