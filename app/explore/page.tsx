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
      
      // Buscar perfis via API
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
        photoURL: userData.mainPhoto,
        premium: userData.premium || false,
        verified: userData.verified || false,
        online: false, // TODO: Implementar status online
        bio: userData.about,
        interests: [],
        lastActive: new Date()
      }))
      
      setProfiles(profilesData)
      
      // Calcular estatísticas
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
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Online Agora</p>
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
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filtros
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* State Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Todos os estados</option>
                    <option value="SP">São Paulo</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="PR">Paraná</option>
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Todas as cidades</option>
                    <option value="São Paulo">São Paulo</option>
                    <option value="Rio de Janeiro">Rio de Janeiro</option>
                    <option value="Belo Horizonte">Belo Horizonte</option>
                    <option value="Porto Alegre">Porto Alegre</option>
                    <option value="Curitiba">Curitiba</option>
                  </select>
                </div>

                {/* User Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <select
                    value={selectedUserType}
                    onChange={(e) => setSelectedUserType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Todos os tipos</option>
                    <option value="SUGAR_BABY">Sugar Baby</option>
                    <option value="SUGAR_DADDY">Sugar Daddy</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedState('')
                      setSelectedCity('')
                      setSelectedUserType('')
                      setSearchTerm('')
                    }}
                    className="w-full px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProfiles.map((profile) => (
            <div key={profile.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* Profile Image */}
              <div className="relative h-48 bg-gradient-to-br from-pink-100 to-purple-100">
                {profile.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-pink-600">
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Premium Badge */}
                {profile.premium && (
                  <div className="absolute top-3 right-3">
                    <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Premium
                    </div>
                  </div>
                )}

                {/* Verified Badge */}
                {profile.verified && (
                  <div className="absolute top-3 left-3">
                    <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Verificado
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{profile.name}</h3>
                    <p className="text-sm text-gray-500">{profile.age} anos</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getUserTypeColor(profile.userType as any)}`}>
                    {getUserTypeAbbreviation(profile.userType as any)}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.city}, {profile.state}</span>
                </div>

                {profile.bio && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{profile.bio}</p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link
                    href={`/profile/${profile.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Perfil
                  </Link>
                  <button className="flex items-center justify-center gap-2 px-4 py-2 border border-pink-600 text-pink-600 rounded-lg hover:bg-pink-50 transition-colors text-sm">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredProfiles.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum perfil encontrado</h3>
            <p className="text-gray-600">Tente ajustar os filtros ou termos de busca</p>
          </div>
        )}
      </div>
    </div>
  )
} 