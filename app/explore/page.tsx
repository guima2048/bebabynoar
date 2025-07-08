'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { differenceInYears } from 'date-fns'
import { Search, Heart, ChevronLeft, ChevronRight, Star, TrendingUp, Users, Crown, Filter, MapPin, MessageCircle, Shield, Eye } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { filterVisibleUsers, getUserTypeDisplayName, getUserTypeColor, getUserTypeAbbreviation, canUsersSeeEachOther, User } from '@/lib/user-matching'
import { mockProfiles, MockProfile } from '@/lib/mock-data'
// Firebase removido - usando API SQL

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

export default function ExplorePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedUserType, setSelectedUserType] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    premiumUsers: 0
  })

  // Log para debug
  console.log('🔍 Explore - Componente renderizado')
  console.log('🔍 Explore - User:', user)
  console.log('🔍 Explore - Loading auth:', authLoading)
  console.log('🔍 Explore - Profiles state:', profiles)
  console.log('🔍 Explore - Loading profiles:', loading)

  // Verificar autenticação
  useEffect(() => {
    console.log('🔍 Explore - useEffect auth check - user:', user, 'loading:', authLoading)
    if (!authLoading && !user) {
      console.log('🔍 Explore - Redirecionando para login')
      router.push('/login')
      return
    }
  }, [user, authLoading, router])

  const loadProfiles = async () => {
    console.log('🔍 Explore - loadProfiles chamada')
    if (!user) {
      console.log('🔍 Explore - loadProfiles: usuário não encontrado')
      return
    }
    
    try {
      setLoading(true)
      
      // Buscar perfis via API SQL - mantendo layout idêntico
      const params = new URLSearchParams({
        limit: '50',
        page: '1'
      })
      
      const response = await fetch(`/api/explore?${params}`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar perfis')
      }
      
      const data = await response.json()
      const profilesData: Profile[] = data.users.map((userData: any) => ({
        id: userData.id,
        name: userData.name || userData.username || 'Usuário',
        username: userData.username,
        age: userData.age || 0,
        city: userData.city || '',
        state: userData.state || '',
        userType: userData.userType || 'user',
        photoURL: userData.mainPhoto || userData.photoURL,
        premium: userData.premium || false,
        verified: userData.verified || false,
        online: false, // TODO: Implementar status online
        bio: userData.about || userData.bio,
        interests: userData.interests || [],
        lastActive: new Date()
      }))
      
      setProfiles(profilesData)
      
      // Calcular estatísticas - mantendo layout idêntico
      const totalUsers = profilesData.length
      const onlineUsers = profilesData.filter(p => p.online).length
      const premiumUsers = profilesData.filter(p => p.premium).length
      
      setStats({
        totalUsers,
        onlineUsers,
        premiumUsers
      })
      
    } catch (error) {
      console.error('Erro ao carregar perfis:', error)
      toast.error('Erro ao carregar perfis')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('🔍 Explore - useEffect loadProfiles - user:', user)
    if (user) {
      console.log('🔍 Explore - Chamando loadProfiles')
      loadProfiles()
    }
  }, [user])

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesState = !selectedState || profile.state === selectedState
    const matchesCity = !selectedCity || profile.city === selectedCity
    const matchesUserType = !selectedUserType || profile.userType === selectedUserType
    
    return matchesSearch && matchesState && matchesCity && matchesUserType
  })

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
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfis...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explorar</h1>
          <p className="text-gray-600">Descubra pessoas interessantes</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Usuários Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Online</p>
                <p className="text-2xl font-bold text-gray-900">{stats.onlineUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Premium</p>
                <p className="text-2xl font-bold text-gray-900">{stats.premiumUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

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
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>
            </div>
          )}
        </div>

        {/* Profiles Grid */}
        {profiles.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum perfil encontrado
            </h3>
            <p className="text-gray-600">
              Tente ajustar seus filtros ou volte mais tarde
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProfiles.map((profile) => (
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
        {filteredProfiles.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <div className="text-center">
              <p className="text-gray-600">
                Mostrando {filteredProfiles.length} de {profiles.length} perfis
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function BannerCarousel({ profiles, getAge }: { profiles: MockProfile[]; getAge: (birthdate: string) => number }) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return
    const container = containerRef.current
    const scrollAmount = 200
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="relative group">
      {/* Botões de Navegação */}
      <div className="absolute right-0 top-0 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={() => scroll('left')}
          className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Carrossel */}
      <div 
        ref={containerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
      >
        {profiles.map((profile) => (
          <BannerCard key={profile.id} profile={profile} getAge={getAge} />
        ))}
      </div>
    </div>
  )
}

function BannerCard({ profile, getAge }: { profile: MockProfile; getAge: (birthdate: string) => number }) {
  return (
    <Link href={`/profile/${profile.id}`} className="flex-shrink-0">
      <div className="relative w-64 h-80 rounded-2xl overflow-hidden group cursor-pointer">
        {/* Imagem de fundo */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${profile.photoURL})` }}
        />
        
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Conteúdo */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-right">
          <h3 className="text-white font-bold text-lg mb-1">{profile.username}</h3>
          <p className="text-white/80 text-sm mb-2">
            {getAge(profile.birthdate)} anos • {profile.city}, {profile.state}
          </p>
          <div className="flex justify-end gap-2">
            {profile.isPremium && (
              <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full">
                Premium
              </span>
            )}
            {profile.isVerified && (
              <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-teal-500 text-white text-xs rounded-full">
                Verificado
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

function CategoryRow({ category, getAge }: { category: any; getAge: (birthdate: string) => number }) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return
    const container = containerRef.current
    const scrollAmount = 200
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (category.profiles.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color}`}>
            {category.icon}
          </div>
          <h3 className="text-xl font-bold text-white">{category.title}</h3>
          <span className="text-white/60 text-sm">({category.profiles.length})</span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
      >
        {category.profiles.map((profile: MockProfile) => (
          <ProfileCard 
            key={profile.id} 
            profile={profile} 
            getAge={getAge}
            categoryColor={category.color}
          />
        ))}
      </div>
    </div>
  )
}

function ProfileCard({ profile, getAge, categoryColor }: { profile: MockProfile; getAge: (birthdate: string) => number; categoryColor: string }) {
  return (
    <Link href={`/profile/${profile.id}`} className="flex-shrink-0">
      <div className="relative w-48 h-64 rounded-2xl overflow-hidden group cursor-pointer">
        {/* Imagem de fundo */}
        <div 
          className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-300"
          style={{ backgroundImage: `url(${profile.photoURL})` }}
        />
        
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {profile.isPremium && (
            <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full">
              Premium
            </span>
          )}
          {profile.isVerified && (
            <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-teal-500 text-white text-xs rounded-full">
              ✓
            </span>
          )}
        </div>
        
        {/* Conteúdo */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-base mb-1">{profile.username}</h3>
          <p className="text-white/80 text-sm mb-2">
            {getAge(profile.birthdate)} anos • {profile.city}
          </p>
          <div className="flex items-center gap-2">
                         <span className={`px-2 py-1 bg-gradient-to-r ${categoryColor} text-white text-xs rounded-full`}>
               {getUserTypeAbbreviation(profile.userType as any)}
             </span>
            <button className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors">
              <Heart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
} 