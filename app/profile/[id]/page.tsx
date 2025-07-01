'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getFirestoreDB, getFirebaseStorage } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { ref, listAll, getDownloadURL } from 'firebase/storage'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { differenceInYears } from 'date-fns'
import ReportUserModal from '@/components/ReportUserModal'
import Image from 'next/image'

interface ProfileData {
  username: string
  birthdate: string
  city: string
  state: string
  userType: string
  about?: string
  lookingFor?: string
  photoURL?: string
  email?: string
}

export default function ProfileViewPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [galleryPublic, setGalleryPublic] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) { return }
    loadProfile()
  }, [id])

  const loadProfile = async () => {
    if (!id) { return }

    try {
      const db = getFirestoreDB()
      if (!db) {
        setError('Erro de configuração do banco de dados')
        return
      }
      
      setLoading(true)
      const docRef = doc(db, 'users', id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        setProfile(data as ProfileData)
        
        // Galeria pública
        const storage = getFirebaseStorage()
        if (!storage) {
          console.error('Erro de configuração do storage')
          return
        }
        const pubRef = ref(storage, `users/${id}/gallery/public`)
        const pubList = await listAll(pubRef)
        const pubURLs = await Promise.all(pubList.items.map(item => getDownloadURL(item)))
        setGalleryPublic(pubURLs)
        
        // Registrar visualização do perfil
        if (user && user.id !== id) {
          await recordProfileView(id)
        }
      } else {
        setError('Perfil não encontrado')
      }
    } catch (error) {
      setError('Erro ao carregar perfil')
    } finally {
      setLoading(false)
    }
  }

  // Registrar visualização do perfil
  const recordProfileView = async (profileId: string) => {
    if (!user || !profileId || user.id === profileId) { return }

    try {
      await fetch('/api/record-profile-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          viewerId: user.id,
          profileId: profileId,
          viewerUsername: user.name || user.email?.split('@')[0] || 'Usuário',
        })
      })
    } catch (error) {
      // Removido console.error de produção
    }
  }

  if (loading) { return <div className="text-center py-12">Carregando...</div> }
  if (error) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Erro</h2>
        <p className="mb-4">{error}</p>
        <Link href="/explore" className="btn-primary">Voltar</Link>
      </div>
    )
  }
  if (!profile) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Perfil não encontrado</h2>
        <p className="mb-4">O perfil que você está procurando não existe.</p>
        <Link href="/explore" className="btn-primary">Voltar</Link>
      </div>
    )
  }

  const age = profile.birthdate ? differenceInYears(new Date(), new Date(profile.birthdate)) : null

  const handleSendMessage = async () => {
    if (!user) {
      toast.error('Faça login para enviar mensagens')
      router.push('/login')
      return
    }
    if (user.id === id) {
      toast.error('Você não pode enviar mensagem para si mesmo')
      return
    }
    
    try {
      const res = await fetch('/api/start-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: user.id,
          targetId: id,
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        router.push(`/messages/${data.conversationId}`)
      } else {
        toast.error(data.error || 'Erro ao iniciar conversa')
      }
    } catch (err) {
      toast.error('Erro ao iniciar conversa')
    }
  }

  const handleSendInterest = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para enviar interesse')
      return
    }
    if (!profile) { return }

    try {
      setRequesting(true)
      await fetch('/api/send-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: user.id,
          targetId: id,
          requesterUsername: user.name || user.email?.split('@')[0] || 'Usuário',
        })
      })
      toast.success('Interesse enviado com sucesso!')
    } catch (error) {
      toast.error('Erro ao enviar interesse')
    } finally {
      setRequesting(false)
    }
  }

  const handleRequestPrivatePhotos = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para solicitar fotos privadas')
      return
    }
    if (!profile) { return }

    try {
      setRequesting(true)
      await fetch('/api/request-private-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: user.id,
          targetId: id,
          requesterUsername: user.name || user.email?.split('@')[0] || 'Usuário',
          targetEmail: profile?.email || '',
        })
      })
      toast.success('Solicitação enviada com sucesso!')
    } catch (error) {
      toast.error('Erro ao solicitar fotos')
    } finally {
      setRequesting(false)
    }
  }

  const handleReportUser = () => {
    if (!user) {
      toast.error('Você precisa estar logado para denunciar um usuário')
      return
    }
    if (!profile) { return }
    setShowReportModal(true)
  }

  return (
    <>
      <div className="max-w-2xl mx-auto py-12">
        <div className="flex flex-col items-center gap-4 mb-8">
          <Image
            src={profile.photoURL || '/avatar.png'}
            alt="Foto de perfil"
            width={128}
            height={128}
            sizes="(max-width: 768px) 96px, 128px"
            className="w-32 h-32 rounded-full object-cover border"
            loading="lazy"
            placeholder="empty"
            unoptimized={profile.photoURL?.startsWith('http')}
          />
          <div className="text-2xl font-bold">{profile.username}</div>
          <div className="text-secondary-600">
            {age ? `${age} anos` : ''} • {profile.city}, {profile.state}
          </div>
          <div className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold">
            {profile.userType === 'sugar_baby' ? 'Sugar Baby' : 'Sugar Daddy'}
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-1">Sobre Mim</h2>
          <p className="text-secondary-700 whitespace-pre-line min-h-[48px]">{profile.about || 'Não informado.'}</p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-1">O Que Busco</h2>
          <p className="text-secondary-700 whitespace-pre-line min-h-[48px]">{profile.lookingFor || 'Não informado.'}</p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Galeria Pública</h2>
          <div className="flex flex-wrap gap-4">
            {galleryPublic.length === 0 && <span className="text-secondary-400">Nenhuma foto pública.</span>}
            {galleryPublic.map(url => (
              <Image
                key={url}
                src={url}
                alt="Foto pública"
                width={96}
                height={96}
                sizes="(max-width: 768px) 64px, 96px"
                className="w-24 h-24 object-cover rounded-lg border"
                loading="lazy"
                placeholder="empty"
                unoptimized={url.startsWith('http')}
              />
            ))}
          </div>
        </div>
        
        <div className="flex gap-4 mb-8">
          <button className="btn-primary" onClick={handleSendMessage}>Enviar Mensagem</button>
          <button className="btn-outline" onClick={handleSendInterest}>Curtir/Interesse</button>
          <button className="btn-secondary" onClick={handleRequestPrivatePhotos} disabled={requesting}>
            {requesting ? 'Enviando...' : 'Solicitar Fotos Privadas'}
          </button>
        </div>

        {/* Botão de Denúncia */}
        {user && user.id !== id && (
          <div className="border-t pt-6">
            <button
              onClick={handleReportUser}
              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Denunciar Perfil
            </button>
          </div>
        )}
      </div>

      {/* Modal de Denúncia */}
      <ReportUserModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedUserId={id}
        reportedUserName={profile.username}
      />
    </>
  )
}