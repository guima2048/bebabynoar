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
}

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchProfile()
  }, [user, router])

  const fetchProfile = async () => {
    if (!user) { return }

    try {
      setLoadingProfile(true)
      const docRef = doc(db, 'users', user.id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        setProfile(docSnap.data() as ProfileData)
      } else {
        // Se não tem perfil, redireciona para edição
        router.push('/profile/edit')
      }
    } catch (error) {
      toast.error('Erro ao carregar perfil')
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
      const storageRef = ref(storage, `users/${user.id}/profile/${file.name}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      
      // Atualiza o perfil no Firestore
      const userRef = doc(db, 'users', user.id)
      await updateDoc(userRef, { photoURL: downloadURL })
      
      setProfile(prev => prev ? { ...prev, photoURL: downloadURL } : null)
      toast.success('Foto atualizada com sucesso!')
    } catch (error) {
      toast.error('Erro ao fazer upload da foto')
    } finally {
      setUploadingPhoto(false)
    }
  }

  if (loading || loadingProfile) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <div className="w-48 h-48 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
            <div className="md:w-2/3 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Perfil não encontrado</h2>
        <p className="mb-6">Parece que você ainda não criou seu perfil.</p>
        <Link href="/profile/edit" className="btn-primary">
          Criar Perfil
        </Link>
      </div>
    )
  }

  const age = profile.birthdate ? differenceInYears(new Date(), new Date(profile.birthdate)) : null

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
        <div className="flex gap-3">
          <Link 
            href="/profile/edit" 
            className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Editar
          </Link>
          <Link 
            href="/premium" 
            className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            <Crown className="w-4 h-4" />
            Premium
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Coluna Esquerda - Foto e Info Básica */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            {/* Foto de Perfil */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <img
                  src={profile.photoURL || '/avatar.png'}
                  alt="Foto de perfil"
                  className="w-48 h-48 rounded-full object-cover border-4 border-pink-100"
                />
                <label className="absolute bottom-2 right-2 bg-pink-600 text-white p-2 rounded-full cursor-pointer hover:bg-pink-700 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                </label>
              </div>
              {uploadingPhoto && (
                <div className="mt-2 text-sm text-gray-600">
                  Fazendo upload...
                </div>
              )}
            </div>

            {/* Informações Básicas */}
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.username}</h2>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    profile.userType === 'sugar_baby' 
                      ? 'bg-pink-100 text-pink-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {profile.userType === 'sugar_baby' ? 'Sugar Baby' : 'Sugar Daddy'}
                  </span>
                  {profile.verified && (
                    <Shield className="w-4 h-4 text-green-600" />
                  )}
                  {profile.premium && (
                    <Crown className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{age ? `${age} anos` : 'Idade não informada'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.city}, {profile.state}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>Membro desde {new Date(profile.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Visualizações do perfil</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Likes recebidos</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Mensagens recebidas</span>
                <span className="font-semibold">0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita - Detalhes */}
        <div className="md:col-span-2 space-y-6">
          {/* Sobre Mim */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Sobre Mim</h3>
            {profile.about ? (
              <p className="text-gray-700 leading-relaxed">{profile.about}</p>
            ) : (
              <p className="text-gray-500 italic">Nenhuma informação adicionada.</p>
            )}
          </div>

          {/* O que Procuro */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">O que Procuro</h3>
            {profile.lookingFor ? (
              <p className="text-gray-700 leading-relaxed">{profile.lookingFor}</p>
            ) : (
              <p className="text-gray-500 italic">Nenhuma informação adicionada.</p>
            )}
          </div>

          {/* Ações Rápidas */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link 
                href="/explore" 
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-colors"
              >
                <Eye className="w-6 h-6 text-pink-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Explorar</span>
              </Link>
              
              <Link 
                href="/messages" 
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <MessageCircle className="w-6 h-6 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Mensagens</span>
              </Link>
              
              <Link 
                href="/profile/who-viewed-me" 
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
              >
                <Heart className="w-6 h-6 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Quem Viu</span>
              </Link>
              
              <Link 
                href="/profile/requests" 
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <Star className="w-6 h-6 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Solicitações</span>
              </Link>
            </div>
          </div>

          {/* Status da Conta */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Status da Conta</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tipo de conta</span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  profile.premium 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {profile.premium ? 'Premium' : 'Básica'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Verificação</span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  profile.verified 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {profile.verified ? 'Verificado' : 'Não verificado'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                <span className="px-2 py-1 rounded text-sm font-medium bg-green-100 text-green-700">
                  Ativo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 