'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Search, Filter, MapPin, Heart, MessageCircle, Crown, Shield, Star, Users, TrendingUp, Eye, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Profile {
  id: string
  name: string
  username?: string
  age: number
  city: string
  state: string
  userType: string
  photoURL?: string
  premium: boolean
  verified: boolean
  online: boolean
  bio?: string
  interests?: string[]
  lastActive?: Date
}

export default function SearchPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedUserType, setSelectedUserType] = useState('')
  const [ageRange, setAgeRange] = useState({ min: 18, max: 65 })
  const [showFilters, setShowFilters] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.push('/login')
      return
    }
  }, [user, authLoading, router])

  const handleSearch = async () => {
    if (!user || !db) return

    try {
      setLoading(true)
      setHasSearched(true)
      
      // Buscar perfis do tipo oposto
      const oppositeType = user.userType === 'sugar_daddy' ? 'sugar_baby' : 'sugar_daddy'
      
      const usersRef = collection(db, 'users')
      let q = query(
        usersRef,
        where('userType', '==', oppositeType),
        where('active', '==', true),
        orderBy('lastActive', 'desc'),
        limit(100)
      )
      
      const querySnapshot = await getDocs(q)
      const profilesData: Profile[] = []
      
      for (const doc of querySnapshot.docs) {
        const userData = doc.data()
        if (userData.id !== user.id) { // Excluir o próprio usuário
          const profile: Profile = {
            id: doc.id,
            name: userData.name || userData.username || 'Usuário',
            username: userData.username,
            age: userData.age || 0,
            city: userData.city || '',
            state: userData.state || '',
            userType: userData.userType || 'user',
            photoURL: userData.photoURL,
            premium: userData.premium || false,
            verified: userData.verified || false,
            online: userData.online || false,
            bio: userData.bio,
            interests: userData.interests || [],
            lastActive: userData.lastActive?.toDate()
          }
          
          // Aplicar filtros
          if (matchesFilters(profile)) {
            profilesData.push(profile)
          }
        }
      }
      
      setProfiles(profilesData)
      
    } catch (error) {
      console.error('Erro ao buscar perfis:', error)
      toast.error('Erro ao buscar perfis')
    } finally {
      setLoading(false)
    }
  }

  const matchesFilters = (profile: Profile) => {
    // Filtro de busca por texto
    if (searchTerm && !profile.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !profile.city.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !profile.bio?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // Filtro de estado
    if (selectedState && profile.state !== selectedState) {
      return false
    }
    
    // Filtro de cidade
    if (selectedCity && profile.city !== selectedCity) {
      return false
    }
    
    // Filtro de tipo de usuário
    if (selectedUserType && profile.userType !== selectedUserType) {
      return false
    }
    
    // Filtro de idade
    if (profile.age < ageRange.min || profile.age > ageRange.max) {
      return false
    }
    
    return true
  }

  const formatLastActive = (lastActive?: Date) => {
    if (!lastActive) return 'Desconhecido'
    
    const now = new Date()
    const diffInMinutes = (now.getTime() - lastActive.getTime()) / (1000 * 60)
    
    if (diffInMinutes < 1) return 'Agora'
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m atrás`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d atrás`
    return lastActive.toLocaleDateString('pt-BR')
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // User not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Buscar</h1>
          </div>
          <p className="text-gray-600">Encontre pessoas específicas</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome, cidade ou bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-8 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Filtros</span>
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">Todos os estados</option>
                    <option value="SP">São Paulo</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="PR">Paraná</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">Todas as cidades</option>
                    <option value="São Paulo">São Paulo</option>
                    <option value="Rio de Janeiro">Rio de Janeiro</option>
                    <option value="Belo Horizonte">Belo Horizonte</option>
                    <option value="Porto Alegre">Porto Alegre</option>
                    <option value="Curitiba">Curitiba</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Usuário</label>
                  <select
                    value={selectedUserType}
                    onChange={(e) => setSelectedUserType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">Todos os tipos</option>
                    <option value="sugar_baby">Sugar Baby</option>
                    <option value="sugar_daddy">Sugar Daddy</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Faixa de Idade</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={ageRange.min}
                      onChange={(e) => setAgeRange(prev => ({ ...prev, min: parseInt(e.target.value) || 18 }))}
                      className="w-20 px-2 py-2 border border-gray-200 rounded-lg text-center"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={ageRange.max}
                      onChange={(e) => setAgeRange(prev => ({ ...prev, max: parseInt(e.target.value) || 65 }))}
                      className="w-20 px-2 py-2 border border-gray-200 rounded-lg text-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Resultados da busca
            </h2>
            <p className="text-gray-600">
              {loading ? 'Buscando...' : `${profiles.length} perfil${profiles.length !== 1 ? 's' : ''} encontrado${profiles.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        )}

        {/* Profiles Grid */}
        {hasSearched && !loading && profiles.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum perfil encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              Tente ajustar seus filtros ou termos de busca
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedState('')
                setSelectedCity('')
                setSelectedUserType('')
                setAgeRange({ min: 18, max: 65 })
                setHasSearched(false)
              }}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Limpar filtros
            </button>
          </div>
        ) : hasSearched && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profiles.map((profile) => (
              <div key={profile.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                <div className="relative">
                  <img
                    src={profile.photoURL || '/avatar.png'}
                    alt={profile.name}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                  {profile.online && (
                    <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                  {profile.premium && (
                    <div className="absolute top-3 left-3">
                      <Crown className="w-5 h-5 text-yellow-500" />
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 truncate">{profile.name}</h3>
                    {profile.verified && (
                      <Shield className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.city}, {profile.state}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <span>{profile.age} anos</span>
                    <span>•</span>
                    <span className="capitalize">{profile.userType.replace('_', ' ')}</span>
                  </div>
                  
                  {profile.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{profile.bio}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Ativo {formatLastActive(profile.lastActive)}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/profile/${profile.id}`}
                        className="p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      
                      <Link
                        href={`/messages/${profile.id}`}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {hasSearched && !loading && profiles.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <div className="text-center">
              <p className="text-gray-600">
                Mostrando {profiles.length} perfil{profiles.length !== 1 ? 's' : ''} encontrado{profiles.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
} 