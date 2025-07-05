'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Send, 
  Image as ImageIcon, 
  Smile, 
  MoreVertical, 
  Phone, 
  Video, 
  Shield, 
  Crown, 
  Clock,
  Check,
  CheckCheck,
  MessageCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { collection, query, where, orderBy, getDocs, doc, getDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'

interface Message {
  id: string
  content: string
  timestamp: Date
  senderId: string
  type: 'text' | 'image'
  imageURL?: string
  read: boolean
}

interface ChatUser {
  id: string
  username: string
  photoURL?: string
  userType: string
  premium: boolean
  verified: boolean
  online: boolean
  lastSeen?: Date
}

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [chatUser, setChatUser] = useState<ChatUser | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [typing, setTyping] = useState(false)

  const userId = params.id as string

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.push('/login')
      return
    }

    loadChatData()
  }, [user, authLoading, userId, router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChatData = async () => {
    if (!user || !db || !userId) return

    try {
      setLoading(true)
      
      // Buscar dados do usuário do chat
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (!userDoc.exists()) {
        toast.error('Usuário não encontrado')
        router.push('/messages')
        return
      }

      const userData = userDoc.data()
      setChatUser({
        id: userId,
        username: userData.username || userData.name || 'Usuário',
        photoURL: userData.photoURL,
        userType: userData.userType || 'user',
        premium: userData.premium || false,
        verified: userData.verified || false,
        online: userData.online || false,
        lastSeen: userData.lastSeen?.toDate()
      })

      // Buscar mensagens da conversa
      await loadMessages()
      
    } catch (error) {
      console.error('Erro ao carregar dados do chat:', error)
      toast.error('Erro ao carregar conversa')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    if (!user || !db || !userId) return

    try {
      // Buscar conversa entre os dois usuários
      const conversationsRef = collection(db, 'conversations')
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', user.id)
      )
      
      const querySnapshot = await getDocs(q)
      let conversationId = null
      
      // Encontrar a conversa que contém ambos os usuários
      for (const doc of querySnapshot.docs) {
        const data = doc.data()
        if (data.participants.includes(userId)) {
          conversationId = doc.id
          break
        }
      }

      if (conversationId && db) {
        // Buscar mensagens da conversa
        const messagesRef = collection(db, 'conversations', conversationId, 'messages')
        const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'))
        const messagesSnapshot = await getDocs(messagesQuery)
        
        const messagesData: Message[] = messagesSnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            content: data.content,
            timestamp: data.timestamp?.toDate() || new Date(),
            senderId: data.senderId,
            type: data.type || 'text',
            imageURL: data.imageURL,
            read: data.read || false
          }
        })
        
        setMessages(messagesData)
        
        // Marcar mensagens como lidas
        await markMessagesAsRead(conversationId, messagesData)
      }
      
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    }
  }

  const markMessagesAsRead = async (conversationId: string, messages: Message[]) => {
    if (!user || !db) return

    try {
      const unreadMessages = messages.filter(msg => 
        msg.senderId !== user.id && !msg.read
      )

      for (const message of unreadMessages) {
        const messageRef = doc(db, 'conversations', conversationId, 'messages', message.id)
        await updateDoc(messageRef, { read: true })
      }
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getOrCreateConversation = async (): Promise<string> => {
    if (!user || !db || !userId) throw new Error('Dependências ausentes para criar conversa')

    // Buscar conversa existente
    const conversationsRef = collection(db, 'conversations')
    const q = query(conversationsRef, where('participants', 'array-contains', user.id))
    const querySnapshot = await getDocs(q)
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data()
      if (data.participants.includes(userId)) {
        return doc.id
      }
    }

    // Criar nova conversa
    const newConversation = {
      participants: [user.id, userId],
      lastMessage: '',
      lastMessageTime: serverTimestamp(),
      unreadCount: {}
    }
    
    const docRef = await addDoc(collection(db, 'conversations'), newConversation)
    return docRef.id
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !user || !db || !userId) return

    setSending(true)
    
    try {
      // Buscar ou criar conversa
      const conversationId = await getOrCreateConversation()
      // Adicionar mensagem
      const messagesRef = collection(db, 'conversations', conversationId, 'messages')
      const messageData = {
        content: newMessage,
        timestamp: serverTimestamp(),
        senderId: user.id,
        type: 'text',
        read: false
      }
      
      await addDoc(messagesRef, messageData)
      
      // Atualizar última mensagem da conversa
      const conversationRef = doc(db, 'conversations', conversationId)
      await updateDoc(conversationRef, {
        lastMessage: newMessage,
        lastMessageTime: serverTimestamp(),
        [`unreadCount.${userId}`]: (messages.filter(m => m.senderId === user.id && !m.read).length || 0) + 1
      })
      
      setNewMessage('')
      
      // Recarregar mensagens
      await loadMessages()
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      toast.error('Erro ao enviar mensagem')
    } finally {
      setSending(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user || !db || !userId) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 5MB.')
      return
    }

    setSending(true)
    
    try {
      // Upload da imagem
      if (!storage) {
        toast.error('Erro de configuração do storage')
        return
      }
      const storageRef = ref(storage, `chat-images/${Date.now()}-${file.name}`)
      const snapshot = await uploadBytes(storageRef, file)
      const imageURL = await getDownloadURL(snapshot.ref)

      // Buscar ou criar conversa
      const conversationId = await getOrCreateConversation()
      if (!conversationId) return

      // Adicionar mensagem com imagem
      const messagesRef = collection(db, 'conversations', conversationId, 'messages')
      const messageData = {
        content: 'Imagem enviada',
        timestamp: serverTimestamp(),
        senderId: user.id,
        type: 'image',
        imageURL,
        read: false
      }
      
      await addDoc(messagesRef, messageData)
      
      // Atualizar conversa
      const conversationRef = doc(db, 'conversations', conversationId)
      await updateDoc(conversationRef, {
        lastMessage: '📷 Enviou uma imagem',
        lastMessageTime: serverTimestamp(),
        [`unreadCount.${userId}`]: (messages.filter(m => m.senderId === user.id && !m.read).length || 0) + 1
      })
      
      // Recarregar mensagens
      await loadMessages()
      
    } catch (error) {
      console.error('Erro ao enviar imagem:', error)
      toast.error('Erro ao enviar imagem')
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = (now.getTime() - timestamp.getTime()) / (1000 * 60)
    
    if (diffInMinutes < 1) return 'Agora'
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return timestamp.toLocaleDateString('pt-BR')
  }

  const formatLastSeen = (lastSeen: Date) => {
    const now = new Date()
    const diffInMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60)
    
    if (diffInMinutes < 1) return 'Agora mesmo'
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)} minutos atrás`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} horas atrás`
    return lastSeen.toLocaleDateString('pt-BR')
  }

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando conversa...</p>
        </div>
      </div>
    )
  }

  // User not authenticated
  if (!user) {
    return null
  }

  // User not found
  if (!chatUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <h2 className="text-2xl font-bold mb-4">Usuário não encontrado</h2>
          <p className="text-gray-600 mb-6">Este usuário não existe ou foi removido</p>
          <button 
            onClick={() => router.push('/messages')}
            className="btn-primary w-full"
          >
            Voltar às mensagens
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          {/* Back button and user info */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/messages')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={chatUser.photoURL || '/avatar.png'}
                  alt={chatUser.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {chatUser.online && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-gray-900">{chatUser.username}</h2>
                  {chatUser.verified && (
                    <Shield className="w-4 h-4 text-blue-500" />
                  )}
                  {chatUser.premium && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {chatUser.online ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Online</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3" />
                      <span>Visto {formatLastSeen(chatUser.lastSeen!)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile user info */}
          <div className="sm:hidden">
            <div className="text-center">
              <h2 className="font-semibold text-gray-900 text-sm">{chatUser.username}</h2>
              <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                {chatUser.online ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3" />
                    <span>Visto {formatLastSeen(chatUser.lastSeen!)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma mensagem ainda
            </h3>
            <p className="text-gray-600">
              Seja o primeiro a enviar uma mensagem!
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.senderId === user.id
            const showTimestamp = index === 0 || 
              messages[index - 1].timestamp.getTime() - message.timestamp.getTime() > 5 * 60 * 1000

            return (
              <div key={message.id}>
                {/* Timestamp */}
                {showTimestamp && (
                  <div className="text-center mb-4">
                    <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                )}

                {/* Message */}
                <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs sm:max-w-md lg:max-w-lg ${
                    isOwnMessage ? 'order-2' : 'order-1'
                  }`}>
                    {!isOwnMessage && (
                      <div className="flex items-center gap-2 mb-1">
                        <img
                          src={chatUser.photoURL || '/avatar.png'}
                          alt={chatUser.username}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs text-gray-500">{chatUser.username}</span>
                      </div>
                    )}
                    
                    <div className={`rounded-2xl px-4 py-2 ${
                      isOwnMessage 
                        ? 'bg-pink-600 text-white' 
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}>
                      {message.type === 'image' ? (
                        <img
                          src={message.imageURL}
                          alt="Imagem"
                          className="rounded-lg max-w-full h-auto"
                        />
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    
                    <div className={`flex items-center gap-1 mt-1 ${
                      isOwnMessage ? 'justify-end' : 'justify-start'
                    }`}>
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      {isOwnMessage && (
                        <div className="flex items-center">
                          {message.read ? (
                            <CheckCheck className="w-3 h-3 text-blue-500" />
                          ) : (
                            <Check className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
        
        {/* Typing indicator */}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2">
              <div className="flex items-center gap-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">Digitando...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          {/* Image upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={sending}
          >
            <ImageIcon className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* Emoji picker */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Smile className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* Message input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Digite sua mensagem..."
              className="w-full px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              disabled={sending}
            />
          </div>
          
          {/* Send button */}
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="p-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </div>
  )
} 