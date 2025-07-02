'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth'
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore'
import { getFirestoreDB, auth } from '@/lib/firebase'

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      console.error('Firebase Auth não está inicializado')
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const db = getFirestoreDB()
          if (!db) {
            console.error('Erro de configuração do banco de dados')
            return
          }
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setUser({
              id: user.uid,
              email: user.email || '',
              name: userData.username || user.displayName || '',
              photoURL: userData.photoURL || user.photoURL || '',
              premium: userData.premium || false,
              verified: userData.verified || false,
              userType: userData.userType || 'user',
              isAdmin: userData.isAdmin || false,
            })
          } else {
            setUser({
              id: user.uid,
              email: user.email || '',
              name: user.displayName || '',
              photoURL: user.photoURL || '',
              premium: false,
              verified: false,
              userType: '',
              isAdmin: false
            })
          }
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error)
          setUser({
            id: user.uid,
            email: user.email || '',
            name: user.displayName || '',
            photoURL: user.photoURL || '',
            premium: false,
            verified: false,
            userType: '',
            isAdmin: false
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string): Promise<void> => {
    if (!auth) throw new Error('Firebase Auth não está inicializado')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      // Não retorna nada
    } catch (error: any) {
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: any): Promise<void> => {
    if (!auth) throw new Error('Firebase Auth não está inicializado')
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    const db = getFirestoreDB()
    if (!db) {
      throw new Error('Erro de configuração do banco de dados')
    }
    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      email: user.email || '',
      createdAt: new Date(),
      premium: false,
      verified: false,
    })
    setUser({
      id: user.uid,
      email: user.email || '',
      name: userData.username || user.displayName || '',
      photoURL: userData.photoURL || user.photoURL || '',
      premium: false,
      verified: false,
      userType: userData.userType || 'user',
      isAdmin: userData.isAdmin || false,
    })
    // Não retorna nada (void)
  }

  const logout = async () => {
    if (!auth) throw new Error('Firebase Auth não está inicializado')
    try {
      await signOut(auth)
    } catch (error: any) {
      throw error
    }
  }

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) { throw new Error('Usuário não autenticado') }

    try {
      const db = getFirestoreDB()
      if (!db) {
        throw new Error('Erro de configuração do banco de dados')
      }
      await updateDoc(doc(db, 'users', user.id), data)
      setUser(prev => prev ? { ...prev, ...data } : null)
    } catch (error: any) {
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error('Firebase Auth não está inicializado')
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      throw error
    }
  }

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Usuário não encontrado'
      case 'auth/wrong-password':
        return 'Senha incorreta'
      case 'auth/email-already-in-use':
        return 'Este email já está em uso'
      case 'auth/weak-password':
        return 'A senha deve ter pelo menos 6 caracteres'
      case 'auth/invalid-email':
        return 'Email inválido'
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde'
      default:
        return 'Ocorreu um erro. Tente novamente'
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout,
    updateUserProfile,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
} 