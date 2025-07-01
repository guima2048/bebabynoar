'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getFirestoreDB } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import PhotoUpload from '@/components/PhotoUpload'
import PhotoGallery from '@/components/PhotoGallery'

interface ProfileForm {
  username: string
  birthdate: string
  city: string
  state: string
  userType: string
  about: string
  lookingFor: string
  interests: string[]
  height: string
  weight: string
  education: string
  occupation: string
  income: string
  relationshipStatus: string
  children: string
  smoking: string
  drinking: string
  languages: string[]
}

const interests = [
  'Viagens', 'Música', 'Cinema', 'Literatura', 'Esportes', 'Culinária', 
  'Arte', 'Tecnologia', 'Moda', 'Fitness', 'Dança', 'Fotografia',
  'Jogos', 'Natureza', 'Voluntariado', 'Negócios', 'Investimentos'
]

const languages = [
  'Português', 'Inglês', 'Espanhol', 'Francês', 'Italiano', 'Alemão', 'Chinês', 'Japonês'
]

export default function EditProfilePage() {
  const { user, loading } = useAuth()
  const [formData, setFormData] = useState<ProfileForm>({
    username: '',
    birthdate: '',
    city: '',
    state: '',
    userType: '',
    about: '',
    lookingFor: '',
    interests: [],
    height: '',
    weight: '',
    education: '',
    occupation: '',
    income: '',
    relationshipStatus: '',
    children: '',
    smoking: '',
    drinking: '',
    languages: []
  })
  const [profilePhoto, setProfilePhoto] = useState<string>('')
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
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
      const db = getFirestoreDB()
      if (!db) {
        toast.error('Erro de configuração do banco de dados')
        return
      }
      const docRef = doc(db, 'users', user?.id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        setFormData({
          username: data.username || '',
          birthdate: data.birthdate || '',
          city: data.city || '',
          state: data.state || '',
          userType: data.userType || '',
          about: data.about || '',
          lookingFor: data.lookingFor || '',
          interests: data.interests || [],
          height: data.height || '',
          weight: data.weight || '',
          education: data.education || '',
          occupation: data.occupation || '',
          income: data.income || '',
          relationshipStatus: data.relationshipStatus || '',
          children: data.children || '',
          smoking: data.smoking || '',
          drinking: data.drinking || '',
          languages: data.languages || []
        })
        setProfilePhoto(data.profilePhoto || '')
        setGalleryPhotos(data.photos || [])
      }
    } catch (error) {
      toast.error('Erro ao carregar perfil')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCheckboxChange = (field: 'interests' | 'languages', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const handleProfilePhotoUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setProfilePhoto(urls[0])
    }
  }

  const handleGalleryPhotoUpload = (urls: string[]) => {
    setGalleryPhotos(prev => [...prev, ...urls])
  }

  const handlePhotoDelete = (photoUrl: string) => {
    setGalleryPhotos(prev => prev.filter(url => url !== photoUrl))
  }

  const handleSave = async () => {
    if (!user) { return }

    try {
      const db = getFirestoreDB()
      if (!db) {
        toast.error('Erro de configuração do banco de dados')
        return
      }
      setSaving(true)
      const userRef = doc(db, 'users', user?.id)
      await updateDoc(userRef, {
        ...formData,
        profilePhoto,
        photos: galleryPhotos,
        updatedAt: new Date().toISOString()
      })
      
      toast.success('Perfil atualizado com sucesso!')
      router.push('/profile')
    } catch (error) {
      toast.error('Erro ao salvar perfil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href="/profile"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Perfil</span>
          </Link>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Salvando...' : 'Salvar Perfil'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna Esquerda - Informações Básicas */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Foto de Perfil</h2>
            
            {profilePhoto && (
              <div className="mb-4">
                <img
                  src={profilePhoto}
                  alt="Foto de perfil"
                  className="w-32 h-32 object-cover rounded-full mx-auto"
                />
              </div>
            )}
            
            <PhotoUpload
              userId={user.id}
              type="profile"
              onUploadComplete={handleProfilePhotoUpload}
              maxFiles={1}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações Básicas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome de usuário</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de nascimento</label>
                <input
                  type="date"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de usuário</label>
                <select
                  name="userType"
                  value={formData.userType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Selecione...</option>
                  <option value="sugar-baby">Sugar Baby</option>
                  <option value="sugar-daddy">Sugar Daddy</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Altura</label>
                <input
                  type="text"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  placeholder="Ex: 1.70m"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sobre mim</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biografia</label>
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Conte um pouco sobre você..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">O que procuro</label>
                <textarea
                  name="lookingFor"
                  value={formData.lookingFor}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Descreva o que você está procurando..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita - Informações Adicionais */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Galeria de Fotos</h2>
            
            <PhotoUpload
              userId={user.id}
              type="gallery"
              onUploadComplete={handleGalleryPhotoUpload}
              maxFiles={10}
            />
            
            {galleryPhotos.length > 0 && (
              <div className="mt-6">
                <PhotoGallery
                  photos={galleryPhotos}
                  userId={user.id}
                  isOwner={true}
                  onPhotoDelete={handlePhotoDelete}
                />
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações Profissionais</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Educação</label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profissão</label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Renda</label>
                <select
                  name="income"
                  value={formData.income}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Selecione...</option>
                  <option value="low">Até R$ 3.000</option>
                  <option value="medium">R$ 3.000 - R$ 10.000</option>
                  <option value="high">R$ 10.000 - R$ 50.000</option>
                  <option value="very-high">Acima de R$ 50.000</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado civil</label>
                <select
                  name="relationshipStatus"
                  value={formData.relationshipStatus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Selecione...</option>
                  <option value="single">Solteiro(a)</option>
                  <option value="divorced">Divorciado(a)</option>
                  <option value="widowed">Viúvo(a)</option>
                  <option value="complicated">Complicado</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Interesses</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {interests.map((interest) => (
                <label key={interest} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.interests.includes(interest)}
                    onChange={() => handleCheckboxChange('interests', interest)}
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-700">{interest}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Idiomas</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {languages.map((language) => (
                <label key={language} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.languages.includes(language)}
                    onChange={() => handleCheckboxChange('languages', language)}
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-700">{language}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 