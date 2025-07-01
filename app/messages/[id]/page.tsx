'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/firebase'
import { 
  collection, 
  doc, 
  getDoc, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  where,
  getDocs
} from 'firebase/firestore'
import { Send, ArrowLeft, User, Shield, Crown } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: any
  read: boolean
}

interface ChatUser {
  id: string
  username: string
  photoURL?: string
  userType: string
  premium: boolean
  verified: boolean
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [chatUser, setChatUser] = useState<ChatUser | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [canStartConversation, setCanStartConversation] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatId = params.id as string

  useEffect(() => {
    if (!user || !chatId) { return }

    // Verificar se pode iniciar conversa
    checkConversationPermissions()
    
    // Carregar dados do usuário do chat
    loadChatUser()
    
    // Carregar mensagens
    loadMessages()
  }, [user, chatId])

  const checkConversationPermissions = async () => {
    if (!user) { return }
    if (!db) {
      toast.error('Serviço de banco de dados indisponível')
      return
    }
    
    try {
      // Buscar dados do usuário atual
      const currentUserDoc = await getDoc(doc(db, 'users', user.id))
      const currentUserData = currentUserDoc.data()
      
      // Buscar dados do usuário do chat
      const chatUserDoc = await getDoc(doc(db, 'users', chatId))
      const chatUserData = chatUserDoc.data()
      
      if (!currentUserData || !chatUserData) {
        toast.error('Usuário não encontrado')
        router.push('/messages')
        return
      }

      // Verificar se são tipos diferentes (SB com SD, SD com SB)
      const canStart = currentUserData.userType !== chatUserData.userType
      setCanStartConversation(canStart)

      if (!canStart) {
        toast.error('Você só pode conversar com usuários do tipo oposto')
        router.push('/messages')
      }
    } catch (error) {
      toast.error('Erro ao verificar permissões')
    }
  }

  const loadChatUser = async () => {
    if (!db) {
      toast.error('Serviço de banco de dados indisponível')
      return
    }
    try {
      const userDoc = await getDoc(doc(db, 'users', chatId))
      if (userDoc.exists()) {
        setChatUser({
          id: userDoc.id,
          ...userDoc.data()
        } as ChatUser)
      }
    } catch (error) {
      toast.error('Erro ao carregar dados do usuário')
    }
  }

  const loadMessages = () => {
    if (!user || !chatId) { return }
    if (!db) {
      toast.error('Serviço de banco de dados indisponível')
      return
    }

    // Criar ID único para a conversa (ordenado alfabeticamente)
    const conversationId = [user.id, chatId].sort().join('_')
    
    const messagesQuery = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('timestamp', 'asc')
    )

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[]
      
      setMessages(messagesData)
      setLoading(false)
      
      // Scroll para a última mensagem
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    })

    return unsubscribe
  }

  const sendMessage = async () => {
    if (!user || !chatId || !newMessage.trim() || sending) { return }
    if (!db) {
      toast.error('Serviço de banco de dados indisponível')
      return
    }

    if (!canStartConversation) {
      toast.error('Você não pode iniciar conversa com este usuário')
      return
    }

    setSending(true)
    try {
      const conversationId = [user.id, chatId].sort().join('_')
      
      // Adicionar mensagem
      await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
        senderId: user.id,
        receiverId: chatId,
        content: newMessage.trim(),
        timestamp: serverTimestamp(),
        read: false
      })

      // Enviar notificação
      await fetch('/api/send-message-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: chatId,
          message: newMessage.trim()
        })
      })

      setNewMessage('')
    } catch (error) {
      toast.error('Erro ao enviar mensagem')
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!chatUser) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Usuário não encontrado</h2>
        <Link href="/messages" className="btn-primary">
          Voltar às Mensagens
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <Link href="/messages" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          
          <div className="flex items-center gap-3">
            <img
              src={chatUser.photoURL || '/avatar.png'}
              alt={chatUser.username}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-lg">{chatUser.username}</h2>
                {chatUser.verified && <Shield className="w-4 h-4 text-blue-500" />}
                {chatUser.premium && <Crown className="w-4 h-4 text-yellow-500" />}
              </div>
              <p className="text-sm text-gray-600 capitalize">
                {chatUser.userType.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>Nenhuma mensagem ainda</p>
            <p className="text-sm">Inicie uma conversa enviando uma mensagem!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === user?.id
                    ? 'bg-pink-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.senderId === user?.id ? 'text-pink-200' : 'text-gray-500'
                }`}>
                  {message.timestamp?.toDate?.()?.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  }) || 'Agora'}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            disabled={sending || !canStartConversation}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending || !canStartConversation}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
        
        {!canStartConversation && (
          <p className="text-red-500 text-sm mt-2">
            Você só pode conversar com usuários do tipo oposto
          </p>
        )}
      </div>
    </div>
  )
} 