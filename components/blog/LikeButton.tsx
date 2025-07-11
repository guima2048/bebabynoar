'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Heart } from 'lucide-react'

interface LikeButtonProps {
  postId: string
  initialLikesCount: number
  initialLiked?: boolean
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
}

export default function LikeButton({
  postId,
  initialLikesCount,
  initialLiked = false,
  size = 'md',
  showCount = true
}: LikeButtonProps) {
  const { data: session } = useSession()
  const [liked, setLiked] = useState(initialLiked)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [loading, setLoading] = useState(false)
  const [animating, setAnimating] = useState(false)

  // Verificar se o usuário deu like ao carregar
  useEffect(() => {
    if (session?.user?.id) {
      checkUserLike()
    }
  }, [session?.user?.id, postId])

  const checkUserLike = async () => {
    try {
      const response = await fetch(`/api/blog/likes?postId=${postId}`)
      const data = await response.json()
      
      if (data.success) {
        setLiked(data.liked)
      }
    } catch (error) {
      console.error('Erro ao verificar like:', error)
    }
  }

  const handleLike = async () => {
    if (!session?.user?.id) {
      alert('Você precisa estar logado para curtir posts')
      return
    }

    if (loading) return

    setLoading(true)
    setAnimating(true)

    try {
      const response = await fetch('/api/blog/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      })

      const data = await response.json()

      if (data.success) {
        setLiked(data.liked)
        setLikesCount(prev => data.liked ? prev + 1 : prev - 1)
      } else {
        alert(data.error || 'Erro ao curtir post')
      }
    } catch (error) {
      console.error('Erro ao curtir post:', error)
      alert('Erro ao curtir post')
    } finally {
      setLoading(false)
      setTimeout(() => setAnimating(false), 300)
    }
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleLike}
        disabled={loading}
        className={`
          ${sizeClasses[size]}
          flex items-center justify-center
          rounded-full
          transition-all duration-200
          ${liked
            ? 'bg-pink-100 text-pink-600 hover:bg-pink-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
          ${animating ? 'scale-110' : ''}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <div suppressHydrationWarning>
          <Heart
            className={`
              ${iconSizes[size]}
              transition-all duration-200
              ${liked ? 'fill-current' : ''}
              ${animating ? 'scale-125' : ''}
            `}
          />
        </div>
      </button>
      
      {showCount && (
        <span className="text-sm font-medium text-gray-700">
          {likesCount}
        </span>
      )}
    </div>
  )
} 