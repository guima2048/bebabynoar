'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  limit
} from 'firebase/firestore'
import { getFirestoreDB } from '@/lib/firebase'
import { MessageCircle, Crown, Shield, User, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

interface Conversation {
  id: string
  userId: string
  username: string
  photoURL?: string
  userType: string
  premium: boolean
  verified: boolean
  lastMessage?: string
  lastMessageTime?: any
  unreadCount: number
}

interface UserData {
  username?: string
  photoURL?: string
  userType?: string
  premium?: boolean
  verified?: boolean
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { return }
    loadConversations()
  }, [user])

  const loadConversations = () => {
    if (!user) { return }

    try {
      const db = getFirestoreDB()
      // Buscar conversas onde o usuário atual é participante
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', user.id),
        orderBy('lastMessageTime', 'desc')
      )

      const unsubscribe = onSnapshot(conversationsQuery, async (snapshot) => {
        const conversationsData: Conversation[] = []

        for (const docSnapshot of snapshot.docs) {
          const data = docSnapshot.data()
          const participants = data.participants || []
          
          // Encontrar o outro participante (não o usuário atual)
          const otherUserId = participants.find((id: string) => id !== user.id)
          
          if (otherUserId) {
            try {
              if (!db) {
                console.error('Erro: db não está inicializado em loadConversations')
                continue
              }
              // Buscar dados do outro usuário
              const userDoc = await getDoc(doc(db, 'users', otherUserId))
              if (userDoc.exists()) {
                const userData = userDoc.data() as UserData
                
                // Buscar última mensagem
                const messagesQuery = query(
                  collection(db, 'conversations', docSnapshot.id, 'messages'),
                  orderBy('timestamp', 'desc'),
                  limit(1)
                )
                const messagesSnap = await getDocs(messagesQuery)
                const lastMessage = messagesSnap.docs[0]?.data()

                // Contar mensagens não lidas
                const unreadQuery = query(
                  collection(db, 'conversations', docSnapshot.id, 'messages'),
                  where('receiverId', '==', user.id),
                  where('read', '==', false)
                )
                const unreadSnap = await getDocs(unreadQuery)

                conversationsData.push({
                  id: otherUserId,
                  userId: otherUserId,
                  username: userData.username || 'Usuário',
                  photoURL: userData.photoURL,
                  userType: userData.userType || 'user',
                  premium: userData.premium || false,
                  verified: userData.verified || false,
                  lastMessage: lastMessage?.content,
                  lastMessageTime: lastMessage?.timestamp,
                  unreadCount: unreadSnap.size
                })
              }
            } catch (error) {
              toast.error('Erro ao carregar conversas')
            }
          }
        }

        setConversations(conversationsData)
        setLoading(false)
      })

      return unsubscribe
    } catch (error) {
      toast.error('Erro ao carregar conversas')
    }
  }

  const formatTime = (timestamp: any) => {
    if (!timestamp) { return '' }
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 48) {
      return 'Ontem'
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mensagens</h1>
        <p className="text-gray-600">
          Suas conversas e mensagens privadas
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Nenhuma conversa ainda
          </h2>
          <p className="text-gray-600 mb-6">
            Explore perfis e inicie conversas para começar a se conectar
          </p>
          <Link 
            href="/explore" 
            className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
          >
            Explorar Perfis
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/messages/${conversation.id}`}
              className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={conversation.photoURL || '/avatar.png'}
                    alt={conversation.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 flex gap-1">
                    {conversation.verified && (
                      <Shield className="w-4 h-4 text-blue-500 bg-white rounded-full" />
                    )}
                    {conversation.premium && (
                      <Crown className="w-4 h-4 text-yellow-500 bg-white rounded-full" />
                    )}
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {conversation.username}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="capitalize">
                        {conversation.userType.replace('_', ' ')}
                      </span>
                      {conversation.lastMessageTime && (
                        <span>{formatTime(conversation.lastMessageTime)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600 truncate text-sm">
                      {conversation.lastMessage || 'Nenhuma mensagem ainda'}
                    </p>
                    
                    {conversation.unreadCount > 0 && (
                      <span className="bg-pink-600 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 