'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getFirestoreDB } from '@/lib/firebase'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Eye, Crown, Clock, User, MessageCircle, Heart, Lock } from 'lucide-react'
import { differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns'

interface ProfileView {
  id: string
  viewerId: string
  viewerUsername: string
  viewerPhotoURL?: string
  viewerUserType: string
  viewedAt: any
}

export default function WhoViewedMePage() {
  const { user, loading } = useAuth()
  const [profileViews, setProfileViews] = useState<ProfileView[]>([])
  const [loadingViews, setLoadingViews] = useState(true)
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    if (!user) { return }
    fetchProfileViews()
    checkPremiumStatus()
  }, [user])

  const fetchProfileViews = async () => {
    if (!user) { return }

    try {
      setLoadingViews(true)
      
      const q = query(
        collection(db, 'profile_views'),
        where('profileId', '==', user?.id),
        orderBy('viewedAt', 'desc')
      )
      const snap = await getDocs(q)
      
      const views: ProfileView[] = []
      
      for (const doc of snap.docs) {
        const data = doc.data()
        
        // Busca informações do usuário que visualizou
        const userDoc = await getDocs(query(
          collection(db, 'users'),
          where('__name__', '==', data.viewerId)
        ))
        
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data()
          views.push({
            id: doc.id,
            viewerId: data.viewerId,
            viewerUsername: userData.username,
            viewerPhotoURL: userData.photoURL,
            viewerUserType: userData.userType,
            viewedAt: data.viewedAt
          })
        }
      }
      
      setProfileViews(views)
    } catch (error) {
      toast.error('Erro ao carregar visualizações')
    } finally {
      setLoadingViews(false)
    }
  }

  const checkPremiumStatus = async () => {
    if (!user) { return }

    try {
      const userDoc = await getDocs(query(
        collection(db, 'users'),
        where('__name__', '==', user?.id)
      ))
      
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data()
        setIsPremium(userData.premium || false)
      }
    } catch (error) {
      // Removido console.error de produção
    }
  }

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) { return '' }
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    
    const minutes = differenceInMinutes(now, date)
    const hours = differenceInHours(now, date)
    const days = differenceInDays(now, date)
    
    if (minutes < 1) {
      return 'Agora mesmo'
    } else if (minutes < 60) {
      return `Há ${minutes} minuto${minutes > 1 ? 's' : ''}`
    } else if (hours < 24) {
      return `Há ${hours} hora${hours > 1 ? 's' : ''}`
    } else if (days < 7) {
      return `Há ${days} dia${days > 1 ? 's' : ''}`
    } else {
      return date.toLocaleDateString('pt-BR')
    }
  }

  const getViewerTypeColor = (userType: string) => {
    return userType === 'sugar_baby' 
      ? 'bg-pink-100 text-pink-700' 
      : 'bg-blue-100 text-blue-700'
  }

  const getViewerTypeLabel = (userType: string) => {
    return userType === 'sugar_baby' ? 'Sugar Baby' : 'Sugar Daddy'
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Acesso negado</h2>
        <p className="mb-4">Você precisa estar logado para ver quem visitou seu perfil.</p>
        <Link href="/login" className="btn-primary">Entrar</Link>
      </div>
    )
  }

  if (!isPremium) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Recurso Premium</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Descubra quem visitou seu perfil e aumente suas chances de conexão com o plano Premium.
          </p>
          
          <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Benefícios Premium</h2>
            
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start gap-3">
                <Eye className="w-6 h-6 text-pink-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Ver Quem Visitou</h3>
                  <p className="text-gray-600 text-sm">
                    Veja exatamente quem visualizou seu perfil e quando
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MessageCircle className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Mensagens Ilimitadas</h3>
                  <p className="text-gray-600 text-sm">
                    Envie quantas mensagens quiser sem restrições
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Heart className="w-6 h-6 text-red-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Perfil em Destaque</h3>
                  <p className="text-gray-600 text-sm">
                    Seu perfil aparece primeiro nas buscas
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Lock className="w-6 h-6 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Galeria Privada</h3>
                  <p className="text-gray-600 text-sm">
                    Compartilhe fotos exclusivas com quem você escolher
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/premium" 
              className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center justify-center gap-2">
                <Crown className="w-5 h-5" />
                Seja Premium
              </span>
            </Link>
            <Link 
              href="/profile" 
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors"
            >
              Voltar ao Perfil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Quem Viu Meu Perfil</h1>
        </div>
        <p className="text-gray-600">
          Veja quem visitou seu perfil e aumente suas chances de conexão.
        </p>
      </div>

      {/* Estatísticas */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-pink-600 mb-2">
              {profileViews.length}
            </div>
            <div className="text-gray-600">Visualizações Totais</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {profileViews.filter(v => v.viewerUserType === 'sugar_baby').length}
            </div>
            <div className="text-gray-600">Sugar Babies</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {profileViews.filter(v => v.viewerUserType === 'sugar_daddy').length}
            </div>
            <div className="text-gray-600">Sugar Daddies</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {profileViews.filter(v => {
                const hours = differenceInHours(new Date(), v.viewedAt.toDate())
                return hours < 24
              }).length}
            </div>
            <div className="text-gray-600">Últimas 24h</div>
          </div>
        </div>
      </div>

      {/* Lista de Visualizações */}
      {loadingViews ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando visualizações...</p>
        </div>
      ) : profileViews.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Nenhuma visualização ainda</h3>
          <p className="text-gray-600 mb-4">
            Quando outros usuários visitarem seu perfil, eles aparecerão aqui.
          </p>
          <Link href="/explore" className="btn-primary">
            Explorar Perfis
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {profileViews.map(view => (
            <div key={view.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={view.viewerPhotoURL || '/avatar.png'}
                    alt={view.viewerUsername}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {view.viewerUsername}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getViewerTypeColor(view.viewerUserType)}`}>
                        {getViewerTypeLabel(view.viewerUserType)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(view.viewedAt)}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Link
                    href={`/profile/${view.viewerId}`}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Ver Perfil
                  </Link>
                  <Link
                    href={`/messages`}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Enviar Mensagem
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dicas */}
      <div className="mt-12 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Dicas para Aumentar Visualizações</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <ul className="space-y-2">
            <li>• Mantenha suas fotos atualizadas e de qualidade</li>
            <li>• Complete todas as informações do seu perfil</li>
            <li>• Seja ativo na plataforma regularmente</li>
          </ul>
          <ul className="space-y-2">
            <li>• Envie mensagens para usuários que te interessam</li>
            <li>• Use filtros de busca para encontrar pessoas compatíveis</li>
            <li>• Participe da comunidade e seja autêntico</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 