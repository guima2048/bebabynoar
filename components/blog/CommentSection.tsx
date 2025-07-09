'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Send, User, Clock, MessageCircle } from 'lucide-react'
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
  const { data: session } = useSession()
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
    
    if (!session?.user?.id) {
      alert('Você precisa estar logado para comentar')
      return
    }

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
    <div className="space-y-6">
      {/* Título da seção */}
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-pink-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Comentários ({comments.length})
        </h3>
      </div>

      {/* Formulário de comentário */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {session?.user?.id ? (
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div className="flex items-start gap-3">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'Usuário'}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escreva seu comentário..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                    disabled={submitting}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      Seu comentário será revisado antes de ser publicado.
                    </p>
                    <button
                      type="submit"
                      disabled={submitting || !newComment.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {submitting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Enviar
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Faça login para comentar
              </h4>
              <p className="text-gray-600 mb-4">
                Entre na sua conta para deixar um comentário neste post.
              </p>
              <a
                href="/login"
                className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                Fazer Login
              </a>
            </div>
          )}
        </div>
      )}

      {/* Lista de comentários */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`bg-white rounded-lg border p-4 ${
                comment.status === 'PENDING' 
                  ? 'border-yellow-200 bg-yellow-50' 
                  : comment.status === 'REJECTED'
                  ? 'border-red-200 bg-red-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {comment.author.photoURL ? (
                  <Image
                    src={comment.author.photoURL}
                    alt={comment.author.name || comment.author.username}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {comment.author.name || comment.author.username}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(comment.createdAt)}
                    </span>
                    {comment.status === 'PENDING' && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Aguardando aprovação
                      </span>
                    )}
                    {comment.status === 'REJECTED' && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                        Rejeitado
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                  
                  {/* Botões de ação (apenas para autor ou admin) */}
                  {(session?.user?.id === comment.author.id || session?.user?.isAdmin) && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-xs text-red-600 hover:text-red-800 transition-colors"
                      >
                        Deletar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum comentário ainda
            </h4>
            <p className="text-gray-600">
              Seja o primeiro a comentar neste post!
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 