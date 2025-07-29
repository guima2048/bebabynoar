'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Send, Image as ImageIcon, Smile, ArrowLeft, MoreVertical, Check, CheckCheck, Reply, X, Unlock } from 'lucide-react'
import { toast } from 'react-hot-toast'
import SidebarMenuWrapper from '@/components/SidebarMenuWrapper'
import PrivatePhotoRelease from '@/components/PrivatePhotoRelease'
import Image from 'next/image'

interface Message {
  id: string
  content: string
  createdAt: string
  read: boolean
  replyToMessageId?: string
  replyToMessage?: {
    id: string
    content: string
    senderName: string
  }
  sender: {
    id: string
    name: string
    username: string
    photoURL?: string
  }
  receiver: {
    id: string
    name: string
    username: string
    photoURL?: string
  }
}

interface Conversation {
  id: string
  participant: {
    id: string
    name: string
    username: string
    photoURL?: string
    verified: boolean
    premium: boolean
  }
}

export default function MessagesPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [showPhotoRelease, setShowPhotoRelease] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Verificar autenticação
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
  }, [status, router])

  // Garantir fundo escuro
  useEffect(() => {
    document.body.style.background = '#18181b';
    document.documentElement.style.background = '#18181b';
    return () => {
      document.body.style.background = '';
      document.documentElement.style.background = '';
    };
  }, []);

  const loadConversation = async () => {
    if (!session?.user) return
    
    try {
      setLoading(true)
      
      // Buscar conversa
      const response = await fetch(`/api/conversations/${params.id}`, {
        headers: {
          'x-user-id': session.user.id
        }
      })
      
      if (!response.ok) {
        throw new Error('Conversa não encontrada')
      }
      
      const data = await response.json()
      setConversation(data.conversation)
      
    } catch (error) {
      console.error('Erro ao carregar conversa:', error)
      toast.error('Erro ao carregar conversa')
      router.push('/messages')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    if (!session?.user) return
    
    try {
      // Buscar mensagens
      const response = await fetch(`/api/messages?conversationId=${params.id}`, {
        headers: {
          'x-user-id': session.user.id
        }
      })
      
      if (!response.ok) {
        throw new Error('Erro ao carregar mensagens')
      }
      
      const data = await response.json()
      setMessages(data.messages)
      
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
      toast.error('Erro ao carregar mensagens')
    }
  }

  useEffect(() => {
    if (session?.user) {
      loadConversation()
      loadMessages()
    }
  }, [session, params.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async (content: string) => {
    if (!session?.user || !conversation || !content.trim()) return
    
    try {
      setSending(true)
      
      const messageData = {
        conversationId: params.id,
        receiverId: conversation.participant.id,
        content: content,
        ...(replyingTo && { replyToMessageId: replyingTo.id })
      }
      
      const endpoint = replyingTo ? '/api/messages/reply' : '/api/messages'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': session.user.id
        },
        body: JSON.stringify(messageData)
      })
      
      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem')
      }
      
      const data = await response.json()
      
      // Adicionar nova mensagem à lista
      setMessages(prev => [...prev, data.message])
      setNewMessage('')
      setReplyingTo(null) // Limpar resposta
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      toast.error('Erro ao enviar mensagem')
    } finally {
      setSending(false)
    }
  }

  const handleSendText = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage.trim())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendText()
    }
  }

  const handleReply = (message: Message) => {
    setReplyingTo(message)
  }

  const cancelReply = () => {
    setReplyingTo(null)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem'
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
  }

  // Loading state
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#18181b] flex flex-col md:flex-row">
        <div className="w-full md:w-64 flex-shrink-0 md:h-auto md:block sticky top-0 z-20 bg-[#18181b] border-b border-gray-800 md:border-b-0 md:border-r">
          <SidebarMenuWrapper />
        </div>
        <main className="flex-1 w-full max-w-4xl mx-auto py-4 px-2 sm:px-4 md:py-12 md:px-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando conversa...</p>
          </div>
        </main>
      </div>
    )
  }

  // User not authenticated
  if (status === 'unauthenticated') {
    return null
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-[#18181b] flex flex-col md:flex-row">
        <div className="w-full md:w-64 flex-shrink-0 md:h-auto md:block sticky top-0 z-20 bg-[#18181b] border-b border-gray-800 md:border-b-0 md:border-r">
          <SidebarMenuWrapper />
        </div>
        <main className="flex-1 w-full max-w-4xl mx-auto py-4 px-2 sm:px-4 md:py-12 md:px-8 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Conversa não encontrada</h3>
            <Link href="/messages" className="text-pink-600 hover:text-pink-700">
              Voltar para mensagens
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#18181b] flex flex-col md:flex-row">
      {/* Sidebar: topo no mobile, lateral no desktop */}
      <div className="w-full md:w-64 flex-shrink-0 md:h-auto md:block sticky top-0 z-20 bg-[#18181b] border-b border-gray-800 md:border-b-0 md:border-r">
        <SidebarMenuWrapper />
      </div>
      
      <main className="flex-1 w-full max-w-4xl mx-auto flex flex-col">
        {/* Header */}
        <div className="bg-[#27272a] border-b border-gray-800 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/messages" className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </Link>
            
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                {conversation.participant.photoURL ? (
                  <Image
                    src={conversation.participant.photoURL}
                    alt={conversation.participant.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-bold text-white">
                    {conversation.participant.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-white">{conversation.participant.name}</h2>
                  {conversation.participant.verified && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                  {conversation.participant.premium && (
                    <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">👑</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-400">@{conversation.participant.username}</p>
              </div>
            </div>
            
                         <div className="flex items-center gap-1">
               <button
                 onClick={() => setShowPhotoRelease(true)}
                 className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                 title="Liberar fotos privadas"
               >
                 <Unlock className="w-5 h-5 text-gray-300" />
               </button>
               <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                 <MoreVertical className="w-5 h-5 text-gray-300" />
               </button>
             </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => {
                         const isOwnMessage = message.sender.id === session?.user?.id
            const showDate = index === 0 || 
              formatDate(message.createdAt) !== formatDate(messages[index - 1]?.createdAt)
            
            return (
              <div key={message.id}>
                {showDate && (
                  <div className="flex justify-center mb-4">
                    <span className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                )}
                
                <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                    {!isOwnMessage && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                          {message.sender.photoURL ? (
                            <Image
                              src={message.sender.photoURL}
                              alt={message.sender.name}
                              width={24}
                              height={24}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-bold text-white">
                              {message.sender.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">{message.sender.name}</span>
                      </div>
                    )}
                    
                                         <div
                       className={`rounded-lg px-4 py-2 ${
                         isOwnMessage
                           ? 'bg-pink-600 text-white'
                           : 'bg-gray-800 text-gray-100 border border-gray-700'
                       }`}
                     >
                       {/* Mensagem sendo respondida */}
                       {message.replyToMessage && (
                         <div className={`mb-2 p-2 rounded text-xs ${
                           isOwnMessage ? 'bg-pink-700' : 'bg-gray-700'
                         }`}>
                           <div className="font-medium mb-1">
                             Respondendo a {message.replyToMessage.senderName}
                           </div>
                           <div className="opacity-80 truncate">
                             {message.replyToMessage.content}
                           </div>
                         </div>
                       )}
                       
                       <p className="whitespace-pre-wrap">{message.content}</p>
                      
                      <div className={`flex items-center justify-between mt-1 ${
                        isOwnMessage ? 'text-pink-200' : 'text-gray-500'
                      }`}>
                                                 <span className="text-xs">{formatTime(message.createdAt)}</span>
                         <div className="flex items-center gap-1">
                           {isOwnMessage && session && (
                             <div className="flex items-center">
                               {message.read ? (
                                 <CheckCheck className="w-4 h-4 text-blue-400" />
                               ) : (
                                 <Check className="w-4 h-4" />
                               )}
                             </div>
                           )}
                           <button
                             onClick={() => handleReply(message)}
                             className="p-1 hover:bg-gray-600 rounded transition-colors"
                           >
                             <Reply className="w-3 h-3" />
                           </button>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          
          <div ref={messagesEndRef} />
        </div>

                 {/* Message Input */}
         <div className="bg-[#27272a] border-t border-gray-800 p-4">
           {/* Indicador de resposta */}
           {replyingTo && (
             <div className="mb-3 p-3 bg-gray-800 rounded-lg border-l-4 border-pink-500">
               <div className="flex items-center justify-between">
                 <div className="flex-1">
                   <div className="text-sm font-medium text-pink-400 mb-1">
                     Respondendo a {replyingTo.sender.name}
                   </div>
                   <div className="text-xs text-gray-400 truncate">
                     {replyingTo.content}
                   </div>
                 </div>
                 <button
                   onClick={cancelReply}
                   className="p-1 hover:bg-gray-700 rounded transition-colors"
                 >
                   <X className="w-4 h-4 text-gray-400" />
                 </button>
               </div>
             </div>
           )}
           
           <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              
              <div className="absolute right-2 bottom-2 flex gap-1">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                >
                  <Smile className="w-5 h-5 text-gray-400" />
                </button>
                
                                 <button
                   onClick={() => toast('Upload de imagem em desenvolvimento')}
                   className="p-1 hover:bg-gray-700 rounded transition-colors"
                 >
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            
            <button
              onClick={handleSendText}
              disabled={sending || !newMessage.trim()}
              className="px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          {/* Emoji Picker Placeholder */}
          {showEmojiPicker && (
            <div className="mt-2 p-3 bg-gray-800 rounded-lg">
              <p className="text-gray-400 text-sm">Seletor de emojis em desenvolvimento</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal de liberação de fotos privadas */}
      {showPhotoRelease && conversation && (
        <PrivatePhotoRelease
          targetUserId={conversation.participant.id}
          targetUserName={conversation.participant.name}
          onClose={() => setShowPhotoRelease(false)}
        />
      )}
    </div>
  )
} 