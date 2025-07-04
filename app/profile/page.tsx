'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getFirestoreDB, getFirebaseStorage } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
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
  const [showModal, setShowModal] = useState<null | 'about' | 'lookingFor'>(null);

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
    if (!user) { return }
    try {
      const db = getFirestoreDB()
      if (!db) {
        console.error('[ProfilePage] Erro de configuração do banco de dados')
        return
      }
      setLoadingProfile(true)
      const docRef = doc(db, 'users', user.id)
      const docSnap = await getDoc(docRef)
      console.log('[ProfilePage] docSnap.exists:', docSnap.exists())
      if (docSnap.exists()) {
        setProfile(docSnap.data() as ProfileData)
        console.log('[ProfilePage] Perfil carregado:', docSnap.data())
      } else {
        console.warn('[ProfilePage] Perfil não encontrado, redirecionando para edição')
        router.push('/profile/edit')
      }
    } catch (error) {
      toast.error('Erro ao carregar perfil')
      console.error('[ProfilePage] Erro ao carregar perfil:', error)
    } finally {
      setLoadingProfile(false)
      console.log('[ProfilePage] loadingProfile:', false)
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
      const storage = getFirebaseStorage()
      if (!storage) {
        throw new Error('Erro de configuração do storage')
      }
      setUploadingPhoto(true)
      const storageRef = ref(storage, `users/${user.id}/profile/${file.name}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      
      // Atualiza o perfil no Firestore
      const userRef = doc(getFirestoreDB(), 'users', user.id)
      await updateDoc(userRef, { photoURL: downloadURL })
      
      setProfile(prev => prev ? { ...prev, photoURL: downloadURL } : null)
      toast.success('Foto atualizada com sucesso!')
    } catch (error) {
      toast.error('Erro ao fazer upload da foto')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const publicPhotos = profile && profile.photos ? profile.photos.filter((p: any) => !p.isPrivate) : [];
  const privatePhotos = profile && profile.photos ? profile.photos.filter((p: any) => p.isPrivate) : [];

  const handleAddPublicPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A foto deve ter menos de 5MB');
      return;
    }
    try {
      setUploadingPhoto(true);
      const storage = getFirebaseStorage();
      const storageRef = ref(storage, `users/${user.id}/photos/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      // Atualiza o Firestore no campo 'photos'
      const db = getFirestoreDB();
      const userRef = doc(db, 'users', user.id);
      const docSnap = await getDoc(userRef);
      let photos = (docSnap.exists() && docSnap.data().photos) ? docSnap.data().photos : [];
      const newPhoto = {
        id: `photo_${Date.now()}`,
        url: downloadURL,
        isPrivate: false,
        uploadedAt: new Date().toISOString(),
      };
      photos = [...photos, newPhoto];
      await updateDoc(userRef, { photos });
      setProfile(prev => prev ? { ...prev, photos } : null);
      toast.success('Foto adicionada!');
    } catch (error) {
      toast.error('Erro ao fazer upload da foto');
    } finally {
      setUploadingPhoto(false);
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
      setUploadingPhoto(true);
      const storage = getFirebaseStorage();
      const storageRef = ref(storage, `users/${user.id}/photos/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      // Atualiza o Firestore no campo 'photos'
      const db = getFirestoreDB();
      const userRef = doc(db, 'users', user.id);
      const docSnap = await getDoc(userRef);
      let photos = (docSnap.exists() && docSnap.data().photos) ? docSnap.data().photos : [];
      const newPhoto = {
        id: `photo_${Date.now()}`,
        url: downloadURL,
        isPrivate: true,
        uploadedAt: new Date().toISOString(),
      };
      photos = [...photos, newPhoto];
      await updateDoc(userRef, { photos });
      setProfile(prev => prev ? { ...prev, photos } : null);
      toast.success('Foto privada adicionada!');
    } catch (error) {
      toast.error('Erro ao fazer upload da foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  function renderTruncated(text: string, type: 'about' | 'lookingFor') {
    if (!text) return <span className="text-neutral-400 italic">Não informado.</span>;
    if (text.length <= 120) return <span>{text}</span>;
    return <>
      <span>{text.slice(0, 120)}...</span>
      <button className="ml-2 text-pink-400 underline text-xs font-semibold" onClick={() => setShowModal(type)}>ver mais</button>
    </>;
  }

  // Função para redirecionar ao editar perfil
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

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center bg-[#18181b] min-h-screen text-white">
        <h2 className="text-2xl font-bold mb-4">Perfil não encontrado</h2>
        <p className="mb-6">Parece que você ainda não criou seu perfil.</p>
        <Link href="/profile/edit" className="btn-primary">
          Criar Perfil
        </Link>
      </div>
    )
  }

  const age = profile.birthdate ? differenceInYears(new Date(), new Date(profile.birthdate)) : null

  console.log('[ProfilePage] publicPhotos:', profile.photos)

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-[#18181b]">
      <div className="w-full lg:max-w-[35vw] lg:mx-auto flex flex-col">
        {/* Hero com proporção 1x2 e informações sobrepostos no canto inferior direito */}
        <div className="relative w-full max-w-[400px] mx-auto" style={{ aspectRatio: '1/2' }}>
          <img
            src={
              profile.photos && profile.photos.length >= 2
                ? profile.photos[0].url
                : profile.photoURL
                  ? profile.photoURL
                  : profile.gender === 'mulher'
                    ? '/landing/padraomulher.webp'
                    : '/landing/padraohomem.webp'
            }
            alt="Foto principal"
            className="w-full h-full object-cover rounded-b-2xl"
            style={{ aspectRatio: '1/2' }}
          />
          {/* Botão edit sobreposto à foto, alinhado à direita na altura do username */}
                <button
            className="absolute top-8 right-8 p-0 bg-transparent border-none outline-none text-pink-500 text-2xl font-bold opacity-40 hover:opacity-100 transition-opacity cursor-pointer z-20"
            aria-label="Editar perfil"
            onClick={handleEditProfile}
          >
            <span className="material-icons">edit</span>
                </button>
          {/* Overlay degradê escuro com cor igual ao fundo */}
          <div className="absolute inset-0 pointer-events-none"
              style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0) 35%, #18181b 100%)',
              borderBottomLeftRadius: '1rem',
              borderBottomRightRadius: '1rem',
            }}
          />
          {/* Informações soltas sobre o degradê, sem cards, visual premium */}
          <div className="absolute left-8 bottom-8 flex flex-col gap-3 z-10 max-w-[80%]">
            {/* Nome sobre a foto */}
            <div className="flex items-center mb-1 w-full">
              <span className="text-3xl font-extrabold text-white drop-shadow-lg leading-tight">{profile.username}</span>
                </div>
            {/* Idade, cidade, estado, gênero */}
            {(age || profile.city || profile.state || profile.gender) && (
              <span className="text-pink-600 text-lg font-bold leading-tight mb-2">
                {age ? `${age} anos` : ''}
                {profile.city ? `, ${profile.city}` : ''}
                {profile.state ? `, ${profile.state}` : ''}
                {profile.gender ? `, ${profile.gender === 'mulher' ? 'Mulher' : 'Homem'}` : ''}
                </span>
            )}
        {/* Sobre mim */}
            {profile.about && profile.about.trim() && (
              <div className="max-w-[90vw]">
                <span className="block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-widest">Sobre mim</span>
                <span className="text-neutral-200 text-base font-medium leading-snug max-w-full break-words">
                  {renderTruncated(profile.about, 'about')}
                </span>
            </div>
          )}
        {/* O que busco */}
            {profile.lookingFor && profile.lookingFor.trim() && (
              <div className="max-w-[90vw]">
                <span className="block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-widest">O que busco</span>
                <span className="text-neutral-200 text-base font-medium leading-snug max-w-full break-words">
                  {renderTruncated(profile.lookingFor, 'lookingFor')}
                </span>
            </div>
          )}
            </div>
          {/* Blocos de Relacionamento sugar e Estilo de vida, AGORA DENTRO DO CARD */}
          {(profile.relationshipType || profile.height || profile.weight || profile.hasChildren !== undefined || profile.smokes !== undefined || profile.drinks !== undefined || profile.education || profile.profession || profile.availableForTravel) && (
            <div className="flex flex-col gap-4 mt-6 items-start ml-8">
              {/* Relacionamento sugar */}
              {profile.relationshipType && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-pink-400 text-base font-semibold leading-tight">{profile.relationshipType}</span>
            </div>
          )}
              {/* Estilo de vida */}
              <div className="flex flex-wrap gap-3 text-pink-400 text-base font-semibold leading-tight justify-start">
                {profile.height && <span>Altura: {profile.height}</span>}
                {profile.weight && <span>Peso: {profile.weight}</span>}
                {profile.hasChildren !== undefined && <span>Filhos: {profile.hasChildren ? 'Sim' : 'Não'}</span>}
                {profile.smokes !== undefined && <span>Fuma: {profile.smokes ? 'Sim' : 'Não'}</span>}
                {profile.drinks !== undefined && <span>Bebe: {profile.drinks ? 'Sim' : 'Não'}</span>}
                {profile.education && <span>Educação: {profile.education}</span>}
                {profile.profession && <span>Profissão: {profile.profession}</span>}
                {profile.availableForTravel && <span>Disponível para viagem: {profile.availableForTravel}</span>}
              </div>
            </div>
          )}
          {/* Grid de fotos públicas */}
          <div className="mt-8 ml-8 max-w-[400px]">
            <h3 className="text-base font-bold text-white mb-2">Adicionar fotos públicas</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {publicPhotos.slice(0, 6).map((photo, i) => (
                <div key={photo.id || i} className="aspect-[3/4] w-full bg-[#232326] rounded-lg overflow-hidden flex items-center justify-center border-2 border-neutral-700">
                  <img src={photo.url} alt="Foto pública" className="w-full h-full object-cover" />
                </div>
              ))}
              {Array.from({ length: 6 - publicPhotos.length }).map((_, i) => (
                <label key={i} className="aspect-[3/4] w-full bg-[#232326] rounded-lg flex items-center justify-center border-2 border-dashed border-neutral-700 hover:border-pink-500 transition-colors cursor-pointer">
                  <span className="text-3xl text-neutral-500">+</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAddPublicPhoto} />
                </label>
              ))}
              </div>
            </div>
          {/* Grid de fotos privadas */}
          <div className="mt-8 ml-8 max-w-[400px]">
            <h3 className="text-base font-bold text-white mb-2">Adicionar fotos privadas</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {privatePhotos.slice(0, 6).map((photo, i) => (
                <div key={photo.id || i} className="aspect-[3/4] w-full bg-[#232326] rounded-lg overflow-hidden flex items-center justify-center border-2 border-neutral-700">
                  <img src={photo.url} alt="Foto privada" className="w-full h-full object-cover" />
                </div>
              ))}
              {Array.from({ length: 6 - privatePhotos.length }).map((_, i) => (
                <label key={i} className="aspect-[3/4] w-full bg-[#232326] rounded-lg flex items-center justify-center border-2 border-dashed border-neutral-700 hover:border-pink-500 transition-colors cursor-pointer">
                  <span className="text-3xl text-neutral-500">+</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAddPrivatePhoto} />
                </label>
              ))}
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
            {showModal === 'about' ? 'Sobre mim' : 'O que busco'}
          </h2>
          <p className="whitespace-pre-line text-base mb-6">
            {showModal === 'about' ? profile.about : profile.lookingFor}
          </p>
          <button className="mt-2 px-4 py-2 rounded bg-pink-500 text-white font-semibold hover:bg-pink-600 transition" onClick={() => setShowModal(null)}>
            Fechar
                  </button>
                </div>
      </Modal>
    </div>
  )
} 
