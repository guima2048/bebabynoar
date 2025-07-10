'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Check, X, Eye, MessageSquare, User, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Comment {
  id: string
  content: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM'
  createdAt: Date
  updatedAt: Date
  author: {
    id: string
    name?: string
    username: string
    photoURL?: string
  }
  post: {
    id: string
    title: string
    slug: string
  }
}

export default function CommentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [moderating, setModerating] = useState<string | null>(null)

  // Verificar se é admin
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user?.id || !session.user.isAdmin) {
      router.push('/admin/')
    }
  }, [session, status, router])

  // Buscar comentários
  useEffect(() => {
    if (session?.user?.isAdmin) {
      fetchComments()
    }
  }, [session, filter])

  const fetchComments = async () => {
    try {
      const statusParam = filter === 'ALL' ? '' : `&status=${filter}`
      const response = await fetch(`/api/blog/comments?${statusParam}`)
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

  const handleModerate = async (commentId: string, status: 'APPROVED' | 'REJECTED' | 'SPAM') => {
    setModerating(commentId)
    
    try {
      const response = await fetch('/api/blog/comments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: commentId,
          status,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Atualizar comentário na lista
        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, status: data.comment.status }
            : comment
        ))
        
        const statusText = status === 'APPROVED' ? 'aprovado' : 
                          status === 'REJECTED' ? 'rejeitado' : 'marcado como spam'
        alert(`Comentário ${statusText}!`)
      } else {
        alert(data.error || 'Erro ao moderar comentário')
      }
    } catch (error) {
      console.error('Erro ao moderar comentário:', error)
      alert('Erro ao moderar comentário')
    } finally {
      setModerating(null)
    }
  }

  const handleDelete = async (commentId: string) => {
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
        alert('Comentário deletado!')
      } else {
        alert(data.error || 'Erro ao deletar comentário')
      }
    } catch (error) {
      console.error('Erro ao deletar comentário:', error)
      alert('Erro ao deletar comentário')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      SPAM: 'bg-gray-100 text-gray-800'
    }

    const labels = {
      PENDING: 'Aguardando',
      APPROVED: 'Aprovado',
      REJECTED: 'Rejeitado',
      SPAM: 'Spam'
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: ptBR 
    })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!session?.user?.isAdmin) {
    return null
  }

  const pendingCount = comments.filter(c => c.status === 'PENDING').length
  const approvedCount = comments.filter(c => c.status === 'APPROVED').length
  const rejectedCount = comments.filter(c => c.status === 'REJECTED').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Moderar Comentários</h1>
              <p className="text-gray-600">Aprove ou rejeite comentários do blog</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                  {pendingCount} pendentes
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  {approvedCount} aprovados
                </span>
                <span className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                  {rejectedCount} rejeitados
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'ALL' 
                  ? 'bg-pink-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'PENDING' 
                  ? 'bg-pink-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pendentes ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('APPROVED')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'APPROVED' 
                  ? 'bg-pink-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Aprovados
            </button>
            <button
              onClick={() => setFilter('REJECTED')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'REJECTED' 
                  ? 'bg-pink-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Rejeitados
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {comments.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum comentário encontrado
              </h3>
              <p className="text-gray-600">
                {filter === 'PENDING' ? 'Não há comentários pendentes de moderação.' :
                 filter === 'APPROVED' ? 'Não há comentários aprovados.' :
                 filter === 'REJECTED' ? 'Não há comentários rejeitados.' :
                 'Não há comentários.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`bg-white rounded-lg border p-6 ${
                    comment.status === 'PENDING' 
                      ? 'border-yellow-200 bg-yellow-50' 
                      : comment.status === 'REJECTED'
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Author Info */}
                    <div className="flex-shrink-0">
                      {comment.author.photoURL ? (
                        <img
                          src={comment.author.photoURL}
                          alt={comment.author.name || comment.author.username}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Comment Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {comment.author.name || comment.author.username}
                        </span>
                        {getStatusBadge(comment.status)}
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-3">{comment.content}</p>

                      {/* Post Info */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-600 mb-1">Comentário em:</p>
                        <a
                          href={`/blog/${comment.post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-pink-600 hover:text-pink-700 flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          {comment.post.title}
                        </a>
                      </div>

                      {/* Actions */}
                      {comment.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleModerate(comment.id, 'APPROVED')}
                            disabled={moderating === comment.id}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            <Check className="w-3 h-3" />
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleModerate(comment.id, 'REJECTED')}
                            disabled={moderating === comment.id}
                            className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            <X className="w-3 h-3" />
                            Rejeitar
                          </button>
                          <button
                            onClick={() => handleModerate(comment.id, 'SPAM')}
                            disabled={moderating === comment.id}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50"
                          >
                            Spam
                          </button>
                        </div>
                      )}

                      {comment.status !== 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            <X className="w-3 h-3" />
                            Deletar
                          </button>
                          {comment.status === 'REJECTED' && (
                            <button
                              onClick={() => handleModerate(comment.id, 'APPROVED')}
                              disabled={moderating === comment.id}
                              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              <Check className="w-3 h-3" />
                              Aprovar
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 