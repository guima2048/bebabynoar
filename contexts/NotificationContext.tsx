'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp,
  addDoc,
  writeBatch,
  deleteDoc
} from 'firebase/firestore'
import { getFirestoreDB } from '@/lib/firebase'

interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: Date
  readAt?: Date
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  loading: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setNotifications([])
      setLoading(false)
      return
    }

    setLoading(true)

    // Buscar notificações do usuário
    const db = getFirestoreDB()
    if (!db) {
      console.error('Erro de configuração do banco de dados')
      setLoading(false)
      return
    }
    
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        readAt: doc.data().readAt?.toDate()
      })) as Notification[]

      setNotifications(notificationsList)
      setLoading(false)
    }, (error) => {
      console.error('Erro ao buscar notificações:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const markAsRead = async (notificationId: string) => {
    if (!user) { return }

    try {
      const db = getFirestoreDB()
      if (!db) {
        console.error('Erro de configuração do banco de dados')
        return
      }
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      })
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!user) { return }

    try {
      const db = getFirestoreDB()
      if (!db) {
        console.error('Erro de configuração do banco de dados')
        return
      }
      const batch = writeBatch(db)
      const unreadNotifications = notifications.filter(n => !n.read)
      
      unreadNotifications.forEach(notification => {
        const notificationRef = doc(db, 'notifications', notification.id)
        batch.update(notificationRef, { read: true })
      })
      
      await batch.commit()
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loading
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider')
  }
  return context
} 