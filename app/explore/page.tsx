'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { 
  Search, 
  Filter, 
  Users, 
  Eye, 
  Crown, 
  Shield, 
  MapPin, 
  MessageCircle,
  Heart,
  Star
} from 'lucide-react'
import { differenceInYears } from 'date-fns'
import SidebarMenuWrapper from '@/components/SidebarMenuWrapper';
import Image from 'next/image';

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
  gender?: string
}

interface User { id: string; username?: string; userType?: string; [key: string]: any }

export default function ExplorePage() {
  const { data: session, status } = useSession()
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated' && session?.user) {
      loadProfiles(session.user)
    }
  }, [status, session, router])

  useEffect(() => {
    // Garante fundo escuro no body e html apenas nesta página
    document.body.style.background = '#18181b';
    document.documentElement.style.background = '#18181b';
    return () => {
      document.body.style.background = '';
      document.documentElement.style.background = '';
    };
  }, []);

  const loadProfiles = async (user: any) => {
    if (!user) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        state: selectedState,
        city: selectedCity,
        userType: selectedUserType
      })

      const response = await fetch(`/api/explore?${params}`, {
        headers: {
          'x-user-id': user.id
        }
      })
      const data = await response.json()

      if (response.ok) {
        setProfiles(data.users || [])
        setStats({
          totalUsers: data.totalUsers || 0,
          onlineUsers: data.onlineUsers || 0,
          premiumUsers: data.premiumUsers || 0
        })
      } else {
        toast.error('Erro ao carregar perfis')
      }
    } catch (error) {
      toast.error('Erro ao carregar perfis')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar perfis baseado no termo de busca
  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.state.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesState = !selectedState || profile.state === selectedState
    const matchesCity = !selectedCity || profile.city === selectedCity
    const matchesUserType = !selectedUserType || profile.userType === selectedUserType
    
    return matchesSearch && matchesState && matchesCity && matchesUserType
  })

  const formatLastActive = (lastActive?: Date) => {
    if (!lastActive) return 'recentemente'
    
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'agora'
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`
    return `${Math.floor(diffInMinutes / 1440)}d atrás`
  }

  function sanitizeText(text: string) {
    return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Estado de carregamento da autenticação
  if (status === 'loading') {
    return <div className="max-w-4xl mx-auto py-12 px-4 text-center bg-[#18181b] min-h-screen text-white">Carregando...</div>
  }
  if (status === 'unauthenticated' || !session?.user) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center bg-[#18181b] min-h-screen text-white">
        <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
        <p className="mb-6">Você precisa estar logado para explorar usuários</p>
        <Link href="/login" className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors">
          Fazer Login
        </Link>
      </div>
    )
  }

  // Carregamento dos perfis
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 bg-[#18181b] min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#18181b] flex flex-col md:flex-row">
      {/* Sidebar: topo no mobile, lateral no desktop */}
      <div className="w-full md:w-64 flex-shrink-0 md:h-auto md:block sticky top-0 z-20 bg-[#18181b] border-b border-gray-800 md:border-b-0 md:border-r">
        <SidebarMenuWrapper />
      </div>
      <main className="flex-1 w-full max-w-4xl mx-auto py-4 px-2 sm:px-4 md:py-12 md:px-8">
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Explorar</h1>
          <p className="text-gray-400 text-sm md:text-base">Descubra novos usuários e faça conexões</p>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 md:grid-cols-3 md:gap-4 mb-4 md:mb-8">
          <div className="bg-[#232326] rounded-lg p-2 md:p-4 border border-gray-700 flex flex-col items-center">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-pink-600/20 rounded-lg flex items-center justify-center mb-1 md:mb-0">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-pink-500" />
            </div>
            <p className="text-xs md:text-sm text-gray-400">Usuários</p>
            <p className="text-lg md:text-2xl font-bold text-white">{stats.totalUsers}</p>
          </div>
          <div className="bg-[#232326] rounded-lg p-2 md:p-4 border border-gray-700 flex flex-col items-center">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-600/20 rounded-lg flex items-center justify-center mb-1 md:mb-0">
              <Eye className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
            </div>
            <p className="text-xs md:text-sm text-gray-400">Online</p>
            <p className="text-lg md:text-2xl font-bold text-white">{stats.onlineUsers}</p>
          </div>
          <div className="bg-[#232326] rounded-lg p-2 md:p-4 border border-gray-700 flex flex-col items-center">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center mb-1 md:mb-0">
              <Crown className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
            </div>
            <p className="text-xs md:text-sm text-gray-400">Premium</p>
            <p className="text-lg md:text-2xl font-bold text-white">{stats.premiumUsers}</p>
          </div>
        </div>
        {/* Search and Filters */}
        <div className="bg-[#232326] rounded-lg p-2 md:p-4 mb-4 md:mb-8 border border-gray-700">
          <div className="flex flex-col gap-2 md:flex-row md:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <input
                type="text"
                placeholder="Buscar por nome ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-2 py-2 md:pl-10 md:pr-4 md:py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-pink-400 focus:border-pink-600 text-white placeholder-gray-200 text-sm md:text-base"
                aria-label="Buscar por nome ou cidade"
              />
            </div>
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-white focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none text-sm md:text-base"
              aria-label="Abrir filtros de busca"
            >
              <Filter className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <span className="text-gray-300">Filtros</span>
            </button>
          </div>
          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-600">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1 md:mb-2">Estado</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-2 py-2 md:px-3 md:py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-pink-400 text-white placeholder-gray-200 text-xs md:text-base"
                    aria-label="Filtrar por estado"
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
                  <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1 md:mb-2">Cidade</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-2 py-2 md:px-3 md:py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-pink-400 text-white placeholder-gray-200 text-xs md:text-base"
                    aria-label="Filtrar por cidade"
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
                  <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1 md:mb-2">Tipo de Usuário</label>
                  <select
                    value={selectedUserType}
                    onChange={(e) => setSelectedUserType(e.target.value)}
                    className="w-full px-2 py-2 md:px-3 md:py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-pink-400 text-white placeholder-gray-200 text-xs md:text-base"
                    aria-label="Filtrar por tipo de usuário"
                  >
                    <option value="">Todos os tipos</option>
                    <option value="SUGAR_BABY">Sugar Baby</option>
                    <option value="SUGAR_DADDY">Sugar Daddy</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Profiles Grid */}
        {filteredProfiles.length === 0 ? (
          <div className="bg-[#232326] rounded-lg p-6 md:p-8 text-center border border-gray-700">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-gray-500" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-white mb-2">
              Nenhum perfil encontrado
            </h3>
            <p className="text-gray-400 text-sm md:text-base">
              Tente ajustar seus filtros ou volte mais tarde
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 md:gap-6">
            {filteredProfiles.map((profile) => (
              <Link key={profile.id} href={`/profile/${profile.id}`} className="block group focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none" aria-label={`Ver perfil de ${profile.name}`}>
                <div className="bg-[#232326] rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="relative">
                    <Image
                      src={
                        profile.photoURL
                          ? profile.photoURL
                          : profile.gender === 'MALE'
                          ? '/landing/padraohomem.webp'
                          : profile.gender === 'FEMALE'
                          ? '/landing/padraomulher.webp'
                          : '/avatar.png'
                      }
                      alt={`Foto do perfil de ${profile.name}`}
                      width={400}
                      height={192}
                      className="w-full h-40 md:h-48 object-cover rounded-t-lg border-2 border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-400"
                      loading="lazy"
                    />
                    {profile.online && (
                      <div className="absolute top-2 right-2 md:top-3 md:right-3 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-[#232326]"></div>
                    )}
                    {profile.premium && (
                      <div className="absolute top-2 left-2 md:top-3 md:left-3">
                        <Crown className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    <div className="flex items-center justify-between mb-1 md:mb-2">
                      <h3 className="font-semibold text-white truncate text-base md:text-lg">{sanitizeText(profile.name)}</h3>
                      {profile.verified && (
                        <Shield className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400 mb-1 md:mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{sanitizeText(profile.city)}, {sanitizeText(profile.state)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mb-2 md:mb-3">
                      <span>{profile.age} anos</span>
                      <span>•</span>
                      <span className="capitalize">{profile.userType.replace('_', ' ')}</span>
                    </div>
                    {profile.bio && (
                      <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-4 line-clamp-2">{sanitizeText(profile.bio)}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Ativo {formatLastActive(profile.lastActive)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="p-2 bg-pink-600/20 text-pink-500 rounded-lg group-hover:bg-pink-600/30 transition-colors">
                          <Eye className="w-4 h-4" />
                        </span>
                        <Link
                          href={`/messages/${profile.id}`}
                          className="p-2 bg-blue-600/20 text-blue-500 rounded-lg hover:bg-blue-600/30 transition-colors focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none"
                          onClick={e => e.stopPropagation()}
                          aria-label={`Iniciar conversa com ${profile.name}`}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        {/* Footer */}
        {filteredProfiles.length > 0 && (
          <div className="mt-6 md:mt-8 bg-[#232326] rounded-lg p-3 md:p-4 border border-gray-700">
            <div className="flex items-center justify-between text-xs md:text-sm text-gray-400">
              <span>{filteredProfiles.length} perfil{filteredProfiles.length !== 1 ? 's' : ''} encontrado{filteredProfiles.length !== 1 ? 's' : ''}</span>
              <span>
                {profiles.filter(p => p.online).length} online
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 