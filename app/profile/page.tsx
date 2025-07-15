'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { 
  Edit, 
  Camera, 
  Settings, 
  Heart, 
  Eye, 
  MessageCircle, 
  Crown, 
  Star,
  MapPin,
  Calendar,
  User,
  Shield
} from 'lucide-react'
import { differenceInYears } from 'date-fns'
import Modal from 'react-modal';

interface ProfileData {
  username: string
  birthdate: string
  city: string
  state: string
  userType: string
  about?: string
  lookingFor?: string
  photoURL?: string
  premium: boolean
  verified: boolean
  createdAt: string
  photos?: { id: string; url: string; isPrivate: boolean; uploadedAt: string }[]
  relationshipType?: string
  height?: string
  weight?: string
  hasChildren?: boolean
  smokes?: boolean
  drinks?: boolean
  education?: string
  profession?: string
  travelMode?: {
    active: boolean
    destination?: string
    from?: string
    to?: string
    looking?: string
  }
  social?: Record<string, string>
  gender?: string
  availableForTravel?: string
}

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const router = useRouter()
  const [showModal, setShowModal] = useState<null | { type: 'about' | 'lookingFor', text: string }>(null);

  useEffect(() => {
    console.log('[ProfilePage] useEffect:', { loading, user })
    if (!loading && !user) {
      console.log('[ProfilePage] Redirecionando para login')
      router.push('/login')
      return
    }
    if (user) {
      console.log('[ProfilePage] Chamando fetchProfile')
      fetchProfile()
    }
  }, [user, loading, router])

  useEffect(() => {
    // Garante fundo escuro no body e html apenas nesta página
    document.body.style.background = '#18181b';
    document.documentElement.style.background = '#18181b';
    return () => {
      document.body.style.background = '';
      document.documentElement.style.background = '';
    };
  }, []);

  const fetchProfile = async () => {
    if (!user) { 
      console.log('[ProfilePage] fetchProfile: Sem usuário')
      return 
    }
    
    console.log('[ProfilePage] fetchProfile: Iniciando busca do perfil para usuário:', user.id, user.email)
    
    try {
      setLoadingProfile(true)
      const response = await fetch(`/api/user/profile`)
      
      console.log('[ProfilePage] fetchProfile: Response status:', response.status)
      console.log('[ProfilePage] fetchProfile: Response ok:', response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('[ProfilePage] fetchProfile: Dados recebidos:', data)
        
        if (data.user) {
          setProfile(data.user as ProfileData)
          console.log('[ProfilePage] fetchProfile: Perfil definido com sucesso')
        } else {
          console.log('[ProfilePage] fetchProfile: Dados do usuário não encontrados na resposta')
          // Se não há dados do usuário, criar um perfil básico com os dados da sessão
          const basicProfile: ProfileData = {
            username: user.name || user.email?.split('@')[0] || 'Usuário',
            birthdate: new Date().toISOString(),
            city: '',
            state: '',
            userType: user.userType || 'USER',
            about: '',
            lookingFor: '',
            photoURL: user.photoURL || '',
            premium: user.premium || false,
            verified: user.verified || false,
            createdAt: new Date().toISOString(),
            photos: [],
            gender: '',
            relationshipType: '',
            height: '',
            weight: '',
            hasChildren: null as any,
            smokes: null as any,
            drinks: null as any,
            education: '',
            profession: '',
            availableForTravel: ''
          }
          setProfile(basicProfile)
          console.log('[ProfilePage] fetchProfile: Perfil básico criado')
        }
      } else {
        console.log('[ProfilePage] fetchProfile: Erro na resposta:', response.status)
        // Se há erro na API, criar um perfil básico com os dados da sessão
        const basicProfile: ProfileData = {
          username: user.name || user.email?.split('@')[0] || 'Usuário',
          birthdate: new Date().toISOString(),
          city: '',
          state: '',
          userType: user.userType || 'USER',
          about: '',
          lookingFor: '',
          photoURL: user.photoURL || '',
          premium: user.premium || false,
          verified: user.verified || false,
          createdAt: new Date().toISOString(),
          photos: [],
          gender: '',
          relationshipType: '',
          height: '',
          weight: '',
          hasChildren: null as any,
          smokes: null as any,
          drinks: null as any,
          education: '',
          profession: '',
          availableForTravel: ''
        }
        setProfile(basicProfile)
        console.log('[ProfilePage] fetchProfile: Perfil básico criado devido ao erro da API')
      }
    } catch (error) {
      console.error('[ProfilePage] fetchProfile: Erro ao carregar perfil:', error)
      // Se há erro na requisição, criar um perfil básico com os dados da sessão
      const basicProfile: ProfileData = {
        username: user.name || user.email?.split('@')[0] || 'Usuário',
        birthdate: new Date().toISOString(),
        city: '',
        state: '',
        userType: user.userType || 'USER',
        about: '',
        lookingFor: '',
        photoURL: user.photoURL || '',
        premium: user.premium || false,
        verified: user.verified || false,
        createdAt: new Date().toISOString(),
        photos: [],
        gender: '',
        relationshipType: '',
        height: '',
        weight: '',
        hasChildren: null as any,
        smokes: null as any,
        drinks: null as any,
        education: '',
        profession: '',
        availableForTravel: ''
      }
      setProfile(basicProfile)
      console.log('[ProfilePage] fetchProfile: Perfil básico criado devido ao erro de rede')
    } finally {
      setLoadingProfile(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || !e.target.files[0]) { return }

    const file = e.target.files[0]
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A foto deve ter menos de 5MB')
      return
    }

    try {
      setUploadingPhoto(true)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'profile')
      
      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        setProfile(prev => prev ? { ...prev, photoURL: data.photo.url } : null)
        toast.success('Foto atualizada com sucesso!')
      } else {
        toast.error('Erro ao fazer upload da foto')
      }
    } catch (error) {
      toast.error('Erro ao fazer upload da foto')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const publicPhotos = profile && profile.photos ? profile.photos.filter((p: { id: string; url: string; isPrivate: boolean; uploadedAt: string }) => !p.isPrivate) : [];
  const privatePhotos = profile && profile.photos ? profile.photos.filter((p: { id: string; url: string; isPrivate: boolean; uploadedAt: string }) => p.isPrivate) : [];

  const handleAddPublicPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A foto deve ter menos de 5MB');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'public');
      
      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(prev => prev ? {
          ...prev,
          photos: [...(prev.photos || []), data.photo]
        } : null);
        toast.success('Foto pública adicionada!');
      } else {
        toast.error('Erro ao adicionar foto');
      }
    } catch (error) {
      toast.error('Erro ao adicionar foto');
    }
  };

  const handleAddPrivatePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A foto deve ter menos de 5MB');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'private');
      
      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(prev => prev ? {
          ...prev,
          photos: [...(prev.photos || []), data.photo]
        } : null);
        toast.success('Foto privada adicionada!');
      } else {
        toast.error('Erro ao adicionar foto');
      }
    } catch (error) {
      toast.error('Erro ao adicionar foto');
    }
  };

  function renderTruncated(text: string, type: 'about' | 'lookingFor') {
    if (!text) return <span className="text-neutral-400 italic">Não informado.</span>;
    if (text.length <= 120) return <span>{text}</span>;
    return <>
      <span>{text.slice(0, 120)}...</span>
      <button className="ml-2 text-pink-400 underline text-xs font-semibold" onClick={() => setShowModal({ type, text })}>
        ver mais
      </button>
    </>;
  }

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  if (loading || loadingProfile) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 bg-[#18181b] min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-8"></div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <div className="w-48 h-48 bg-gray-700 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-32 mx-auto"></div>
            </div>
            <div className="md:w-2/3 space-y-4">
              <div className="h-6 bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Se não há perfil após o carregamento, mostrar perfil básico
  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center bg-[#18181b] min-h-screen text-white">
        <h2 className="text-2xl font-bold mb-4">Carregando perfil...</h2>
        <p className="mb-6">Aguarde um momento enquanto carregamos suas informações.</p>
      </div>
    )
  }

  const age = profile?.birthdate ? differenceInYears(new Date(), new Date(profile.birthdate)) : null

  console.log('[ProfilePage] publicPhotos:', profile?.photos)

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 bg-[#18181b] min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Coluna da esquerda - Foto e informações básicas */}
        <div className="md:w-1/3">
          <div className="relative">
            <img
              src={
                profile?.photos && profile.photos.length >= 2
                  ? profile.photos[0].url
                  : profile?.photoURL
                  ? profile.photoURL
                  : profile?.gender === 'FEMALE'
                  ? '/landing/padraomulher.webp'
                  : profile?.gender === 'MALE'
                  ? '/landing/padraohomem.webp'
                  : '/avatar.png'
              }
              alt="Foto do perfil"
              className="w-48 h-48 rounded-full mx-auto mb-4 object-cover"
            />
            <label className="absolute bottom-4 right-4 bg-pink-600 text-white p-2 rounded-full cursor-pointer hover:bg-pink-700 transition-colors">
              <Camera size={20} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
              />
            </label>
          </div>
          
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">{profile.username}</h1>
            <div className="flex items-center justify-center gap-2 text-gray-400">
              {age && <span>{age} anos</span>}
              {profile.city && <span>• {profile.city}</span>}
              {profile.state && <span>• {profile.state}</span>}
            </div>
            {profile.premium && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <Crown className="text-yellow-500" size={16} />
                <span className="text-yellow-500 text-sm">Premium</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/profile/edit"
              className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Edit size={16} />
              Editar Perfil
            </Link>
            
            <Link
              href="/messages"
              className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <MessageCircle size={16} />
              Mensagens
            </Link>
            
            <Link
              href="/notifications"
              className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Eye size={16} />
              Notificações
            </Link>
          </div>
        </div>

        {/* Coluna da direita - Informações detalhadas */}
        <div className="md:w-2/3">
          <div className="bg-[#232326] rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Sobre mim</h2>
            <p className="text-gray-300 mb-4">
              {profile.about || 'Nenhuma informação fornecida.'}
            </p>
            
            <h3 className="text-lg font-semibold text-white mb-2">O que busco</h3>
            <p className="text-gray-300">
              {profile.lookingFor || 'Nenhuma informação fornecida.'}
            </p>
          </div>

          <div className="bg-[#232326] rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Informações pessoais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.relationshipType && (
                <div>
                  <span className="text-gray-400">Tipo de relacionamento:</span>
                  <p className="text-white">{profile.relationshipType}</p>
                </div>
              )}
              {profile.height && (
                <div>
                  <span className="text-gray-400">Altura:</span>
                  <p className="text-white">{profile.height}</p>
                </div>
              )}
              {profile.weight && (
                <div>
                  <span className="text-gray-400">Peso:</span>
                  <p className="text-white">{profile.weight}</p>
                </div>
              )}
              {profile.hasChildren !== undefined && (
                <div>
                  <span className="text-gray-400">Tem filhos:</span>
                  <p className="text-white">{profile.hasChildren ? 'Sim' : 'Não'}</p>
                </div>
              )}
              {profile.smokes !== undefined && (
                <div>
                  <span className="text-gray-400">Fuma:</span>
                  <p className="text-white">{profile.smokes ? 'Sim' : 'Não'}</p>
                </div>
              )}
              {profile.drinks !== undefined && (
                <div>
                  <span className="text-gray-400">Bebe:</span>
                  <p className="text-white">{profile.drinks ? 'Sim' : 'Não'}</p>
                </div>
              )}
              {profile.education && (
                <div>
                  <span className="text-gray-400">Educação:</span>
                  <p className="text-white">{profile.education}</p>
                </div>
              )}
              {profile.profession && (
                <div>
                  <span className="text-gray-400">Profissão:</span>
                  <p className="text-white">{profile.profession}</p>
                </div>
              )}
              {profile.availableForTravel && (
                <div>
                  <span className="text-gray-400">Disponível para viagem:</span>
                  <p className="text-white">{profile.availableForTravel}</p>
                </div>
              )}
            </div>
          </div>

          {/* Galeria de fotos */}
          <div className="bg-[#232326] rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Galeria de fotos</h2>
            
            {/* Fotos públicas */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Fotos públicas</h3>
              <div className="grid grid-cols-3 gap-4">
                {publicPhotos.slice(0, 6).map((photo, i) => (
                  <div key={photo.id || i} className="aspect-[3/4] bg-gray-700 rounded-lg overflow-hidden">
                    <img src={photo.url} alt="Foto pública" className="w-full h-full object-cover" />
                  </div>
                ))}
                {Array.from({ length: 6 - publicPhotos.length }).map((_, i) => (
                  <label key={i} className="aspect-[3/4] bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600 hover:border-pink-500 transition-colors cursor-pointer">
                    <span className="text-3xl text-gray-500">+</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAddPublicPhoto} />
                  </label>
                ))}
              </div>
            </div>

            {/* Fotos privadas */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Fotos privadas</h3>
              <div className="grid grid-cols-3 gap-4">
                {privatePhotos.slice(0, 6).map((photo, i) => (
                  <div key={photo.id || i} className="aspect-[3/4] bg-gray-700 rounded-lg overflow-hidden">
                    <img src={photo.url} alt="Foto privada" className="w-full h-full object-cover" />
                  </div>
                ))}
                {Array.from({ length: 6 - privatePhotos.length }).map((_, i) => (
                  <label key={i} className="aspect-[3/4] bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600 hover:border-pink-500 transition-colors cursor-pointer">
                    <span className="text-3xl text-gray-500">+</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAddPrivatePhoto} />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para texto completo */}
      <Modal
        isOpen={!!showModal}
        onRequestClose={() => setShowModal(null)}
        className="fixed inset-0 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0 bg-black/70 z-40"
        ariaHideApp={false}
      >
        <div className="bg-[#232326] rounded-2xl p-6 max-w-[90vw] max-h-[80vh] overflow-y-auto shadow-xl text-white">
          <h2 className="text-lg font-bold mb-4">
            {showModal?.type === 'about' ? 'Sobre mim' : 'O que busco'}
          </h2>
          <p className="whitespace-pre-line text-base mb-6">
            {showModal?.text}
          </p>
          <button className="mt-2 px-4 py-2 rounded bg-pink-500 text-white font-semibold hover:bg-pink-600 transition" onClick={() => setShowModal(null)}>
            Fechar
          </button>
        </div>
      </Modal>
    </div>
  )
} 
