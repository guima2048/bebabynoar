'use client'

import React, { createContext, useEffect, useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import bcrypt from 'bcryptjs'

interface User {
  id: string
  email: string
  name: string
  age?: number
  gender?: string
  location?: string
  photos?: string[]
  bio?: string
  interests?: string[]
  lookingFor?: string
  premium?: boolean
  verified?: boolean
  createdAt?: Date
  lastActive?: Date
  photoURL?: string
  userType: string
  isAdmin: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>
  logout: () => Promise<void>
  updateUserProfile: (data: Partial<User>) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  getAuthToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true)
      return
    }

    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        photoURL: session.user.image,
        premium: session.user.premium,
        verified: session.user.verified,
        userType: session.user.userType,
        isAdmin: session.user.isAdmin,
      })
    } else {
      setUser(null)
    }
    
    setLoading(false)
  }, [session, status])

  const handleSignIn = async (email: string, password: string): Promise<void> => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      toast.success('Login realizado com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login')
      throw error
    }
  }

  const handleSignUp = async (email: string, password: string, userData: any): Promise<void> => {
    try {
      // Criar usuário via API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          ...userData,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao cadastrar')
      }

      // Fazer login automaticamente
      await handleSignIn(email, password)
      toast.success('Cadastro realizado com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cadastrar')
      throw error
    }
  }

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      setUser(null)
      toast.success('Logout realizado com sucesso!')
      router.push('/')
    } catch (error) {
      toast.error('Erro ao fazer logout')
    }
  }

  const updateUserProfile = async (data: Partial<User>) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar perfil')
      }

      // Atualizar estado local
      if (user) {
        setUser({ ...user, ...data })
      }

      toast.success('Perfil atualizado com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar perfil')
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar email de reset')
      }

      toast.success('Email de recuperação enviado!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar email de reset')
      throw error
    }
  }

  const getAuthToken = async (): Promise<string | null> => {
    // Para NextAuth, o token é gerenciado automaticamente
    return null
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        logout: handleLogout,
        updateUserProfile,
        resetPassword,
        getAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext 