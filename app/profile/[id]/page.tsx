'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { differenceInYears } from 'date-fns'
import ReportUserModal from '@/components/ReportUserModal'
import Image from 'next/image'
import { canUsersSeeEachOther, User } from '@/lib/user-matching'


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
  name?: string
  location?: string
  gender?: string
  status?: string
  photos?: Array<{ url: string; isPrivate: boolean; id?: string }>
  relationshipType?: string
  height?: string
  weight?: string
  hasChildren?: boolean
  smokes?: boolean
  drinks?: boolean
  education?: string
  profession?: string
  availableForTravel?: string
}

export default function ProfileViewPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [galleryPublic, setGalleryPublic] = useState<string[]>([])
  const [galleryPrivate, setGalleryPrivate] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showMore, setShowMore] = useState<{ type: 'about' | 'lookingFor', text: string } | null>(null)
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const userHasPrivateAccess = false
  const [carouselIndex, setCarouselIndex] = useState(0)
  const allPhotos = [
    ...galleryPublic.map(url => ({ url, isPrivate: false })),
    ...galleryPrivate.map(url => ({ url, isPrivate: true })),
  ]
  const handlePrev = () => {
    if (carouselIndex === 0) {
      setCarouselIndex(allPhotos.length - 1)
    } else {
      setCarouselIndex(i => i - 1)
    }
  }
  const handleNext = () => {
    if (carouselIndex === allPhotos.length - 1) {
      setCarouselIndex(0)
    } else {
      setCarouselIndex(i => i + 1)
    }
  }

  useEffect(() => {
    if (!id) { return }
    loadProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, reloadKey])

  const loadProfile = async () => {
    if (!id) { return }

    try {
      setLoading(true)
      
      // Buscar perfil via API
      const response = await fetch(`/api/user/profile/${id}`)
      
      if (!response.ok) {
        setError('Perfil não encontrado')
        return
      }
      
      const data = await response.json()
      console.log('📸 [Profile] Dados completos do usuário:', data)
      setProfile(data.user as ProfileData)
      
      // Carregar fotos
      const photos = data.photos || []
      console.log('📸 [Profile] Array de fotos:', photos)
      
      const publicPhotos = photos
        .filter((photo: { url: string; isPrivate: boolean; id?: string }) => !photo.isPrivate)
        .map((photo: { url: string; isPrivate: boolean; id?: string }) => photo.url)
      setGalleryPublic(publicPhotos)
      
      const privatePhotos = photos
        .filter((photo: { url: string; isPrivate: boolean; id?: string }) => photo.isPrivate)
        .map((photo: { url: string; isPrivate: boolean; id?: string }) => photo.url)
      setGalleryPrivate(privatePhotos)
      
      // Registrar visualização do perfil
      if (user && user.id !== id) {
        await recordProfileView(id)
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
        <Link href="/search" className="btn-primary">Voltar</Link>
      </div>
    )
  }
  if (!profile) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Perfil não encontrado</h2>
        <p className="mb-4">O perfil que você está procurando não existe.</p>
        <Link href="/search" className="btn-primary">Voltar</Link>
      </div>
    )
  }

  // Verificar permissões de acesso
  if (user && profile) {
    const currentUser: User = {
      id: user.id,
      userType: user.userType as any,
      gender: user.gender as any || 'female',
      lookingFor: user.lookingFor as any || 'male',
      username: user.name
    }

    const targetUser: User = {
      id: id as string,
      userType: profile.userType as any,
      gender: profile.gender as any || 'female',
      lookingFor: profile.lookingFor as any || 'male',
      username: profile.username
    }

    if (!canUsersSeeEachOther(currentUser, targetUser)) {
      router.push('/profile/access-denied')
      return null
    }
  }

  const age = profile.birthdate ? differenceInYears(new Date(), new Date(profile.birthdate)) : null

  // Função para truncar texto e mostrar "ver mais"
  function renderTruncated(text: string, type: 'about' | 'lookingFor') {
    if (!text) return <span className="text-neutral-400 italic">Não informado.</span>;
    if (text.length <= 120) return <span>{text}</span>;
    return <>
      <span>{text.slice(0, 120)}...</span>
      <button className="ml-2 text-pink-400 underline text-xs font-semibold" onClick={() => setShowMore({ type, text })}>
        ver mais
      </button>
    </>;
  }

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

  // Função de upload de foto
  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    
    console.log('📸 [Profile Upload] Iniciando upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId: id
    })
    
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB')
      return
    }
    
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', id)
      formData.append('isPrivate', 'false') // Apenas pública por padrão
      
      console.log('📸 [Profile Upload] Enviando para /api/upload-photo...')
      
      const res = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData,
      })
      
      console.log('📸 [Profile Upload] Resposta recebida:', res.status, res.statusText)
      
      if (!res.ok) {
        const errorText = await res.text()
        console.error('📸 [Profile Upload] Erro do servidor:', errorText)
        throw new Error(errorText)
      }
      
      const result = await res.json()
      console.log('📸 [Profile Upload] Sucesso:', result)
      
      toast.success('Foto enviada com sucesso!')
      
      // Forçar recarregamento da galeria
      setReloadKey(k => k + 1)
      
    } catch (error: any) {
      console.error('📸 [Profile Upload] Erro no upload:', error)
      toast.error('Erro ao enviar foto: ' + (error?.message || 'Erro desconhecido'))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-[#18181b]">
      <div className="w-full max-w-[400px] mx-auto flex flex-col px-4">
        {/* Hero com proporção 1x2 e informações sobrepostos no canto inferior direito */}
        <div className="relative w-full" style={{ aspectRatio: '1/2' }}>
          {allPhotos.length > 0 ? (
            <>
              <img
                src={allPhotos[carouselIndex].url}
                alt="Foto do perfil"
                className={allPhotos[carouselIndex].isPrivate ? 'w-full h-full object-cover blur-[8px] brightness-75' : 'w-full h-full object-cover'}
                style={{ aspectRatio: '1/2' }}
              />
              {/* Overlay degradê escuro */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 35%, #18181b 100%)', borderBottomLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}
              />
              {/* Botões de navegação */}
              {allPhotos.length > 1 && (
                <>
                  <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 z-20">
                    &#8592;
                  </button>
                  <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 z-20">
                    &#8594;
                  </button>
                </>
              )}
              {/* Dots indicadores */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                {allPhotos.map((_, i) => (
                  <span key={i} className={`w-2 h-2 rounded-full ${i === carouselIndex ? 'bg-pink-500' : 'bg-white/40'}`}></span>
                ))}
              </div>
              {/* Label de foto privada */}
              {allPhotos[carouselIndex].isPrivate && (
                <span className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full z-20">Foto privada</span>
              )}
              {allPhotos[carouselIndex].isPrivate && (
                <button
                  className="absolute left-1/2 -translate-x-1/2 bg-pink-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg hover:bg-pink-700 transition z-30"
                  style={{ minWidth: 180, top: '25%' }}
                  onClick={handleRequestPrivatePhotos}
                  disabled={requesting}
                >
                  {requesting ? 'Enviando...' : 'Solicitar acesso'}
                </button>
              )}
            </>
          ) : (
            <img
              src={
                profile.photoURL
                  ? profile.photoURL
                  : profile.gender === 'FEMALE'
                  ? '/landing/padraomulher.webp'
                  : profile.gender === 'MALE'
                  ? '/landing/padraohomem.webp'
                  : '/avatar.png'
              }
              alt="Foto padrão"
              className="w-full h-full object-cover rounded-b-2xl"
              style={{ aspectRatio: '1/2' }}
            />
          )}
          {/* Informações soltas sobre o degradê, sem cards, visual premium */}
          <div className="absolute left-4 bottom-4 flex flex-col gap-3 z-10 max-w-[85%]">
            {/* Nome sobre a foto */}
            <div className="flex items-center mb-1 w-full">
              <span className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-lg leading-tight">{profile.username}</span>
            </div>
            {/* Idade, cidade, estado, gênero */}
            {(age || profile.city || profile.state || profile.gender) && (
              <span className="text-pink-600 text-base sm:text-lg font-bold leading-tight mb-2">
                {age ? `${age} anos` : ''}
                {profile.city ? `, ${profile.city}` : ''}
                {profile.state ? `, ${profile.state}` : ''}
                {profile.gender ? `, ${profile.gender === 'FEMALE' ? 'Mulher' : 'Homem'}` : ''}
              </span>
            )}

            {/* Sobre mim */}
            <div className="max-w-full">
              <span className="block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-widest">Sobre mim</span>
              <span className="text-neutral-200 text-sm sm:text-base font-medium leading-snug max-w-full break-words">
                {renderTruncated(profile.about || '', 'about')}
              </span>
            </div>
            {/* O que busco */}
            <div className="max-w-full">
              <span className="block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-widest">O que busco</span>
              <span className="text-neutral-200 text-sm sm:text-base font-medium leading-snug max-w-full break-words">
                {renderTruncated(profile.lookingFor || '', 'lookingFor')}
              </span>
            </div>
          </div>
        </div>
        {/* Debug: Mostrar todos os campos disponíveis */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 w-full p-4 bg-gray-800 rounded-lg text-xs text-white">
            <h4 className="font-bold mb-2">DEBUG - Campos do perfil:</h4>
            <pre className="whitespace-pre-wrap">
              {JSON.stringify({
                about: profile.about,
                lookingFor: profile.lookingFor,
                relationshipType: profile.relationshipType,
                height: profile.height,
                weight: profile.weight,
                hasChildren: profile.hasChildren,
                smokes: profile.smokes,
                drinks: profile.drinks,
                education: profile.education,
                profession: profile.profession,
                availableForTravel: profile.availableForTravel,
                gender: profile.gender
              }, null, 2)}
            </pre>
          </div>
        )}
        
        {/* Blocos de Relacionamento sugar e Estilo de vida */}
        <div className="flex flex-col gap-4 mt-6 items-start">
          {/* Relacionamento sugar */}
          {profile.relationshipType && (
            <div className="flex flex-wrap gap-2">
              <span className="text-pink-400 text-sm sm:text-base font-semibold leading-tight">{profile.relationshipType}</span>
            </div>
          )}
          {/* Estilo de vida */}
          <div className="flex flex-wrap gap-2 sm:gap-3 text-pink-400 text-sm sm:text-base font-semibold leading-tight justify-start">
            {profile.height && <span>Altura: {profile.height}</span>}
            {profile.weight && <span>Peso: {profile.weight}</span>}
            {profile.hasChildren !== undefined && <span>Filhos: {profile.hasChildren ? 'Sim' : 'Não'}</span>}
            {profile.smokes !== undefined && <span>Fuma: {profile.smokes ? 'Sim' : 'Não'}</span>}
            {profile.drinks !== undefined && <span>Bebe: {profile.drinks ? 'Sim' : 'Não'}</span>}
            {profile.education && <span>Educação: {profile.education}</span>}
            {profile.profession && <span>Profissão: {profile.profession}</span>}
            {profile.availableForTravel && (
              <span>Disponível para viagem: {profile.availableForTravel === 'Sim' ? 'Sim' : 'Não'}</span>
            )}
          </div>
          {/* Debug: Mostrar se não há dados */}
          {!profile.relationshipType && !profile.height && !profile.weight && profile.hasChildren === undefined && profile.smokes === undefined && profile.drinks === undefined && !profile.education && !profile.profession && !profile.availableForTravel && (
            <span className="text-neutral-500 text-sm">Nenhuma informação de estilo de vida disponível.</span>
          )}
        </div>
        {/* Grid de fotos públicas */}
        <div className="mt-8 w-full">
          <h3 className="text-base font-bold text-white mb-2">Galeria pública</h3>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {galleryPublic.slice(0, 6).map((url, i) => (
              <div key={url || i} className="aspect-[3/4] w-full bg-[#232326] rounded-lg overflow-hidden flex items-center justify-center border-2 border-neutral-700">
                <img src={url} alt="Foto pública" className="w-full h-full object-cover" />
              </div>
            ))}
            {galleryPublic.length === 0 && (
              <span className="text-neutral-500 col-span-3 text-sm">Nenhuma foto pública.</span>
            )}
          </div>
        </div>
        {/* Grid de fotos privadas */}
        {galleryPrivate.length > 0 && (
          <div className="mt-8 w-full">
            <h3 className="text-base font-bold text-white mb-2">Galeria privada</h3>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {galleryPrivate.slice(0, 6).map((url, i) => (
                <div key={url || i} className="aspect-[3/4] w-full bg-[#232326] rounded-lg overflow-hidden flex items-center justify-center border-2 border-neutral-700 relative">
                  <img src={url} alt="Foto privada" className="w-full h-full object-cover blur-[96px] brightness-30" />
                  <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs sm:text-sm bg-black/30">Foto privada</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Botões de interação */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 mt-8 w-full">
          <button className="btn-primary text-sm sm:text-base py-3" onClick={handleSendMessage}>Enviar Mensagem</button>
          <button className="btn-outline text-sm sm:text-base py-3" onClick={handleSendInterest}>Favoritar</button>
        </div>
        {/* Botão de denúncia */}
        <div className="mb-8 w-full text-center">
          <button className="text-xs text-red-500 underline" onClick={handleReportUser}>Denunciar perfil</button>
        </div>
      </div>
      {/* Modal de denúncia */}
      {showReportModal && (
        <ReportUserModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportedUserId={id}
          reportedUserName={profile.username}
        />
      )}
      {/* Modal de ver mais */}
      {showMore && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{showMore.type === 'about' ? 'Sobre mim' : 'O que busco'}</h2>
            <p className="text-gray-700 whitespace-pre-line mb-6">{showMore.text}</p>
            <button className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700" onClick={() => setShowMore(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  )
}