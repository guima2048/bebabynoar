'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { differenceInYears } from 'date-fns'
import { Search, Filter, Heart, ArrowLeft, MapPin } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { filterVisibleUsers, User } from '@/lib/user-matching'

interface Profile {
  id: string
  username: string
  birthdate: string
  city: string
  state: string
  userType: string
  photoURL?: string
  about?: string
  isPremium?: boolean
  isVerified?: boolean
}

export default function BuscarPage() {
  const { user, loading, getAuthToken } = useAuth()
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  
  // Estados de busca e filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'sugar_baby' | 'sugar_daddy' | 'sugar_mommy' | 'sugar_babyboy'>('all')
  const [ageRange, setAgeRange] = useState({ min: 18, max: 80 })
  const [locationFilter, setLocationFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Verificar autenticação
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }
  }, [user, loading, router])

  const fetchProfiles = async () => {
    if (!user) return
    
    try {
      setLoadingProfiles(true)
      // Obter token de autenticação
      const token = await getAuthToken()
      
      if (!token) {
        toast.error('Erro de autenticação')
        return
      }
      
      const response = await fetch('/api/explore', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        let allProfiles = data.profiles.filter((profile: Profile) => profile.id !== user.id)
        
        // Aplicar regras de matching
        const currentUser: User = {
          id: user.id,
          userType: user.userType as any,
          gender: user.gender as any || 'female',
          lookingFor: user.lookingFor as any || 'male',
          username: user.name
        }
        
        const visibleProfiles = filterVisibleUsers(currentUser, allProfiles as User[])
        setProfiles(visibleProfiles as unknown as Profile[])
        setFilteredProfiles(visibleProfiles as unknown as Profile[])
      }
    } catch (err) {
      toast.error('Erro ao carregar perfis')
    } finally {
      setLoadingProfiles(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchProfiles()
    }
  }, [user])

  // Aplicar filtros
  useEffect(() => {
    let filtered = profiles
    if (searchTerm) {
      filtered = filtered.filter(profile =>
        profile.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (profile.about && profile.about.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    if (userTypeFilter !== 'all') {
      filtered = filtered.filter(profile => profile.userType === userTypeFilter)
    }
    filtered = filtered.filter(profile => {
      const age = differenceInYears(new Date(), new Date(profile.birthdate))
      return age >= ageRange.min && age <= ageRange.max
    })
    if (locationFilter) {
      filtered = filtered.filter(profile =>
        profile.city.toLowerCase().includes(locationFilter.toLowerCase()) ||
        profile.state.toLowerCase().includes(locationFilter.toLowerCase())
      )
    }
    setFilteredProfiles(filtered)
  }, [profiles, searchTerm, userTypeFilter, ageRange, locationFilter])

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#18181b]">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }
  if (!user) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#18181b]">
        <div className="max-w-md mx-auto text-center text-white px-4">
          <h2 className="text-2xl font-bold mb-4">Acesso negado</h2>
          <p className="mb-6">Você precisa estar logado para buscar perfis.</p>
          <Link href="/login" className="btn-primary">Entrar</Link>
        </div>
      </div>
    )
  }
  function getAge(birthdate: string) {
    return differenceInYears(new Date(), new Date(birthdate))
  }
  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-[#18181b]">
      <div className="w-full lg:max-w-[35vw] lg:mx-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-50 w-full bg-[#18181b] border-b border-white/10">
          <div className="w-full px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/explore" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6 text-white" />
              </Link>
              <h1 className="text-2xl font-bold text-white">Buscar Perfis</h1>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 text-white font-semibold text-base ${showFilters ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-white/10 hover:bg-white/20'}`}
            >
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
            </button>
          </div>
          {/* Campo de Busca */}
          <div className="mt-6 px-6 pb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Buscar por nome, cidade, estado ou descrição..."
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-14 pr-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="bg-black/20 border-b border-white/10 w-full">
            <div className="w-full px-6 py-8 space-y-8">
              {/* Tipo de Usuário */}
              <div>
                <label className="block text-base font-semibold mb-4 text-white">Tipo de Usuário</label>
                <div className="flex gap-3">
                  <button
                    className={`px-6 py-3 rounded-xl text-base font-semibold transition-colors ${userTypeFilter === 'all' ? 'bg-purple-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                    onClick={() => setUserTypeFilter('all')}
                  >Todos</button>
                  <button
                    className={`px-6 py-3 rounded-xl text-base font-semibold transition-colors ${userTypeFilter === 'sugar_baby' ? 'bg-pink-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                    onClick={() => setUserTypeFilter('sugar_baby')}
                  >Sugar Babies</button>
                  <button
                    className={`px-6 py-3 rounded-xl text-base font-semibold transition-colors ${userTypeFilter === 'sugar_daddy' ? 'bg-blue-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                    onClick={() => setUserTypeFilter('sugar_daddy')}
                  >Sugar Daddies</button>
                  <button
                    className={`px-6 py-3 rounded-xl text-base font-semibold transition-colors ${userTypeFilter === 'sugar_mommy' ? 'bg-purple-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                    onClick={() => setUserTypeFilter('sugar_mommy')}
                  >Sugar Mommies</button>
                  <button
                    className={`px-6 py-3 rounded-xl text-base font-semibold transition-colors ${userTypeFilter === 'sugar_babyboy' ? 'bg-green-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                    onClick={() => setUserTypeFilter('sugar_babyboy')}
                  >Sugar Babyboys</button>

                </div>
              </div>

              {/* Faixa Etária */}
              <div>
                <label className="block text-base font-semibold mb-4 text-white">Faixa Etária</label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="18"
                    max="80"
                    value={ageRange.min}
                    onChange={(e) => setAgeRange(prev => ({ ...prev, min: parseInt(e.target.value) || 18 }))}
                    className="w-20 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-center text-base text-white"
                  />
                  <span className="text-white text-base">a</span>
                  <input
                    type="number"
                    min="18"
                    max="80"
                    value={ageRange.max}
                    onChange={(e) => setAgeRange(prev => ({ ...prev, max: parseInt(e.target.value) || 80 }))}
                    className="w-20 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-center text-base text-white"
                  />
                  <span className="text-white text-base">anos</span>
                </div>
              </div>

              {/* Localização */}
              <div>
                <label className="block text-base font-semibold mb-4 text-white">Localização</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cidade ou estado..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </div>
              </div>

              {/* Limpar Filtros */}
              <div>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setUserTypeFilter('all')
                    setAgeRange({ min: 18, max: 80 })
                    setLocationFilter('')
                  }}
                  className="w-full px-6 py-4 bg-red-500 hover:bg-red-600 rounded-xl transition-colors text-base font-semibold text-white"
                >Limpar Filtros</button>
              </div>
            </div>
          </div>
        )}

        {/* Resultados */}
        <div className="w-full px-6 py-8">
          <div className="mb-6 text-gray-400 text-base">{filteredProfiles.length} perfil{filteredProfiles.length !== 1 ? 's' : ''} encontrado{filteredProfiles.length !== 1 ? 's' : ''}{searchTerm && ` para "${searchTerm}"`}</div>
          
          {loadingProfiles ? (
            <div className="text-center py-12">
              <div className="text-white text-xl">Carregando perfis...</div>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-xl mb-4">Nenhum perfil encontrado</div>
              <p className="text-gray-500 text-base">Tente ajustar os filtros ou termos de busca</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredProfiles.map((profile) => (
                <ProfileCard 
                  key={profile.id} 
                  profile={profile} 
                  getAge={getAge}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProfileCard({ profile, getAge }: { profile: Profile; getAge: (birthdate: string) => number }) {
  return (
    <Link href={`/profile/${profile.id}`} className="group">
      <div className="bg-white/5 hover:bg-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 border border-white/10 flex flex-col">
        {/* Imagem */}
        <div className="relative h-80">
          <img
            src={profile.photoURL || '/avatar.png'}
            alt={profile.username}
            className="w-full h-full object-cover"
          />
          {/* Overlay com gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {/* Badges */}
          <div className="absolute top-4 right-4 flex gap-2">
            {profile.isPremium && (
              <div className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-white">Premium</div>
            )}
            {profile.isVerified && (
              <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-teal-500 rounded-full text-xs font-bold text-white">✓</div>
            )}
            <div className={`px-3 py-1 bg-gradient-to-r ${profile.userType === 'sugar_baby' ? 'from-pink-500 to-purple-500' : 'from-blue-500 to-indigo-500'} rounded-full text-xs font-bold text-white`}>{profile.userType === 'sugar_baby' ? 'SB' : 'SD'}</div>
          </div>
          {/* Botão de Like */}
          <button className="absolute bottom-4 right-4 p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
            <Heart className="w-6 h-6 text-white" />
          </button>
        </div>
        {/* Informações */}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="font-bold text-xl mb-3 group-hover:text-white transition-colors text-white">{profile.username}</h3>
          <p className="text-gray-400 text-base mb-4">{getAge(profile.birthdate)} anos • {profile.city}, {profile.state}</p>
          {profile.about && (
            <p className="text-gray-300 text-base line-clamp-3 leading-relaxed">{profile.about}</p>
          )}
        </div>
      </div>
    </Link>
  )
} 