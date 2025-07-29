'use client'

import { useState, useEffect } from 'react'
import { Send, User, Clock, MessageCircle, Heart, Trash2, Edit } from 'lucide-react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Comment {
  id: string
  content: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM'
  createdAt: Date
  author: {
    id: string
    name?: string
    username: string
    photoURL?: string
  }
}

interface CommentSectionProps {
  postId: string
  initialComments?: Comment[]
  showForm?: boolean
}

export default function CommentSection({ 
  postId, 
  initialComments = [], 
  showForm = true 
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: ptBR 
    })
  }

  // Buscar comentários
  const fetchComments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/blog/comments?postId=${postId}`)
      const data = await response.json()
      
      if (data.success) {
        setComments(data.comments)
      }
    } catch (error) {
      console.error('Erro ao buscar comentários:', error)
    } finally {
      setLoading(false)
    }
  }

  // Carregar comentários iniciais
  useEffect(() => {
    if (initialComments.length === 0) {
      fetchComments()
    }
  }, [postId, initialComments.length])

  // Enviar comentário
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Remover qualquer import de next-auth/react e uso de useSession
    // if (!session?.user?.id) {
    //   alert('Você precisa estar logado para comentar')
    //   return
    // }

    if (!newComment.trim()) {
      alert('Digite um comentário')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          content: newComment.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setNewComment('')
        // Adicionar novo comentário à lista
        setComments(prev => [data.comment, ...prev])
      } else {
        alert(data.error || 'Erro ao enviar comentário')
      }
    } catch (error) {
      console.error('Erro ao enviar comentário:', error)
      alert('Erro ao enviar comentário')
    } finally {
      setSubmitting(false)
    }
  }

  // Deletar comentário
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Tem certeza que deseja deletar este comentário?')) {
      return
    }

    try {
      const response = await fetch(`/api/blog/comments?id=${commentId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setComments(prev => prev.filter(comment => comment.id !== commentId))
      } else {
        alert(data.error || 'Erro ao deletar comentário')
      }
    } catch (error) {
      console.error('Erro ao deletar comentário:', error)
      alert('Erro ao deletar comentário')
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Comentários
          </h3>
          <p className="text-sm text-gray-600">
            {comments.length} comentário{comments.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Formulário de comentário */}
      {showForm && (
        <div className="mb-8 p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100">
          {/* Remover qualquer import de next-auth/react e uso de useSession */}
          {/* {session?.user?.id ? ( */}
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div className="flex items-start gap-4">
                {/* Remover qualquer import de next-auth/react e uso de useSession */}
                {/* {session.user.image ? ( */}
                  <Image
                    src="/placeholder-avatar.jpg" // Placeholder image
                    alt="Usuário"
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-white shadow-sm"
                  />
                {/* ) : ( */}
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
                    <User className="w-6 h-6 text-white" />
                  </div>
                {/* )} */}
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Compartilhe sua opinião sobre este post..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none bg-white shadow-sm"
                    disabled={submitting}
                  />
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-xs text-gray-500">
                      ✨ Seu comentário será revisado antes de ser publicado
                    </p>
                    <button
                      type="submit"
                      disabled={submitting || !newComment.trim()}
                      className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 font-semibold"
                    >
                      {submitting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Enviar Comentário
                    </button>
                  </div>
                </div>
              </div>
            </form>
          {/* ) : ( */}
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Faça login para comentar
              </h4>
              <p className="text-gray-600 mb-4">
                Entre na sua conta para compartilhar sua opinião sobre este post.
              </p>
              <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
                Fazer Login
              </button>
            </div>
          {/* )} */}
        </div>
      )}

      {/* Lista de comentários */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2 w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="group">
              <div className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                {/* Avatar */}
                {comment.author.photoURL ? (
                  <Image
                    src={comment.author.photoURL}
                    alt={comment.author.name || comment.author.username}
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                
                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">
                        {comment.author.name || comment.author.username}
                      </h4>
                      {comment.status === 'PENDING' && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          Aguardando aprovação
                        </span>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 text-gray-400 hover:text-pink-600 transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                      {/* Remover qualquer import de next-auth/react e uso de useSession */}
                      {/* {(session?.user?.id === comment.author.id || session?.user?.isAdmin) && ( */}
                        <>
                          <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      {/* )} */}
                    </div>
                  </div>
                  
                  <p className="text-gray-800 leading-relaxed mb-3">
                    {comment.content}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(comment.createdAt)}</span>
                    </div>
                    <button className="flex items-center gap-1 hover:text-pink-600 transition-colors">
                      <Heart className="w-3 h-3" />
                      <span>Responder</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-pink-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Seja o primeiro a comentar!
            </h4>
            <p className="text-gray-600">
              Compartilhe sua opinião e inicie uma conversa sobre este post.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 