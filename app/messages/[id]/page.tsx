'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Send, Image as ImageIcon, Smile, ArrowLeft, MoreVertical } from 'lucide-react'
import { toast } from 'react-hot-toast'
import EmojiPicker from '@/components/EmojiPicker'
import MessageImageUpload from '@/components/MessageImageUpload'
import TypingIndicator from '@/components/TypingIndicator'

interface Message {
  id: string
  content: string
  type: 'TEXT' | 'IMAGE'
  imageURL?: string
  createdAt: string
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
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Verificar autenticação
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
  }, [user, authLoading, router])

  const loadConversation = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Buscar conversa
      const response = await fetch(`/api/conversations/${params.id}`)
      
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
    if (!user) return
    
    try {
      // Buscar mensagens
      const response = await fetch(`/api/messages?conversationId=${params.id}`)
      
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
    if (user) {
      loadConversation()
      loadMessages()
    }
  }, [user, params.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async (content: string, type: 'TEXT' | 'IMAGE' = 'TEXT', imageURL?: string) => {
    if (!user || !conversation || !content.trim()) return
    
    try {
      setSending(true)
      
      const messageData = {
        conversationId: params.id,
        receiverId: conversation.participant.id,
        content: content,
        type: type,
        imageURL: imageURL
      }
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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

  const handleSendImage = (imageURL: string) => {
    sendMessage('Imagem enviada', 'IMAGE', imageURL)
    setShowImageUpload(false)
  }

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
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

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Conversa não encontrada</h3>
          <Link href="/messages" className="text-pink-600 hover:text-pink-700">
            Voltar para mensagens
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/messages" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center">
              {conversation.participant.photoURL ? (
                <img
                  src={conversation.participant.photoURL}
                  alt={conversation.participant.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-pink-600">
                  {conversation.participant.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900">{conversation.participant.name}</h2>
              <p className="text-sm text-gray-500">@{conversation.participant.username}</p>
            </div>
          </div>
          
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender.id === user.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md ${message.sender.id === user.id ? 'order-2' : 'order-1'}`}>
              {message.sender.id !== user.id && (
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center">
                    {message.sender.photoURL ? (
                      <img
                        src={message.sender.photoURL}
                        alt={message.sender.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-pink-600">
                        {message.sender.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{message.sender.name}</span>
                </div>
              )}
              
              <div
                className={`rounded-lg px-4 py-2 ${
                  message.sender.id === user.id
                    ? 'bg-pink-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                {message.type === 'IMAGE' && message.imageURL ? (
                  <img
                    src={message.imageURL}
                    alt="Imagem"
                    className="rounded-lg max-w-full"
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
                
                <p className={`text-xs mt-1 ${
                  message.sender.id === user.id ? 'text-pink-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendText()
                }
              }}
              placeholder="Digite sua mensagem..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            
            <div className="absolute right-2 bottom-2 flex gap-1">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <Smile className="w-5 h-5 text-gray-500" />
              </button>
              
              <button
                onClick={() => setShowImageUpload(!showImageUpload)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ImageIcon className="w-5 h-5 text-gray-500" />
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
        
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="mt-2">
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          </div>
        )}
        
        {/* Image Upload */}
        {showImageUpload && (
          <div className="mt-2">
            <MessageImageUpload onImageUpload={handleSendImage} />
          </div>
        )}
      </div>
    </div>
  )
} 