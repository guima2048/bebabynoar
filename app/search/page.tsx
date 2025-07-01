'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getFirestoreDB } from '@/lib/firebase'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import Link from 'next/link'
import { differenceInYears } from 'date-fns'
import { Search, Filter, MapPin, Calendar, Users, Heart, Star } from 'lucide-react'

interface Profile {
  id: string
  username: string
  birthdate: string
  city: string
  state: string
  userType: string
  photoURL?: string
  about?: string
  interests?: string[]
  education?: string
  occupation?: string
  relationshipStatus?: string
  children?: string
  smoking?: string
  drinking?: string
  languages?: string[]
}

interface SearchFilters {
  userType: string
  ageMin: number
  ageMax: number
  location: string
  education: string
  relationshipStatus: string
  children: string
  smoking: string
  drinking: string
  interests: string[]
  languages: string[]
}

export default function SearchPage() {
  const { user, loading } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    userType: '',
    ageMin: 18,
    ageMax: 80,
    location: '',
    education: '',
    relationshipStatus: '',
    children: '',
    smoking: '',
    drinking: '',
    interests: [],
    languages: []
  })

  const interests = [
    'Viagens', 'Música', 'Cinema', 'Literatura', 'Esportes', 'Culinária', 
    'Arte', 'Tecnologia', 'Moda', 'Fitness', 'Dança', 'Fotografia',
    'Jogos', 'Natureza', 'Voluntariado', 'Negócios', 'Investimentos'
  ]

  const languages = [
    'Português', 'Inglês', 'Espanhol', 'Francês', 'Italiano', 'Alemão', 'Chinês', 'Japonês'
  ]

  useEffect(() => {
    if (!user) { return }
    fetchProfiles()
  }, [user])

  useEffect(() => {
    applyFilters()
  }, [profiles, filters, searchTerm])

  const fetchProfiles = async () => {
    if (!user) { return }
    
    try {
      const db = getFirestoreDB()
      if (!db) {
        console.error('Erro de configuração do banco de dados')
        return
      }
      
      setLoadingProfiles(true)
      
      const q = query(
        collection(db, 'users'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(100)
      )
      const snap = await getDocs(q)
      
      const allProfiles = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Profile))
        .filter(profile => profile.id !== user.id)
      
      setProfiles(allProfiles)
    } catch (error) {
      // Removido console.error de produção
    } finally {
      setLoadingProfiles(false)
    }
  }

  const applyFilters = () => {
    let filtered = profiles

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(profile =>
        profile.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.about?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por tipo de usuário
    if (filters.userType) {
      filtered = filtered.filter(profile => profile.userType === filters.userType)
    }

    // Filtro por idade
    filtered = filtered.filter(profile => {
      if (!profile.birthdate) { return false }
      const age = differenceInYears(new Date(), new Date(profile.birthdate))
      return age >= filters.ageMin && age <= filters.ageMax
    })

    // Filtro por localização
    if (filters.location) {
      filtered = filtered.filter(profile =>
        profile.city.toLowerCase().includes(filters.location.toLowerCase()) ||
        profile.state.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    // Filtro por educação
    if (filters.education) {
      filtered = filtered.filter(profile => profile.education === filters.education)
    }

    // Filtro por estado civil
    if (filters.relationshipStatus) {
      filtered = filtered.filter(profile => profile.relationshipStatus === filters.relationshipStatus)
    }

    // Filtro por filhos
    if (filters.children) {
      filtered = filtered.filter(profile => profile.children === filters.children)
    }

    // Filtro por fumo
    if (filters.smoking) {
      filtered = filtered.filter(profile => profile.smoking === filters.smoking)
    }

    // Filtro por bebida
    if (filters.drinking) {
      filtered = filtered.filter(profile => profile.drinking === filters.drinking)
    }

    // Filtro por interesses
    if (filters.interests.length > 0) {
      filtered = filtered.filter(profile =>
        profile.interests?.some(interest => filters.interests.includes(interest))
      )
    }

    // Filtro por idiomas
    if (filters.languages.length > 0) {
      filtered = filtered.filter(profile =>
        profile.languages?.some(language => filters.languages.includes(language))
      )
    }

    setFilteredProfiles(filtered)
  }

  const handleFilterChange = (field: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleInterestToggle = (interest: string) => {
    setFilters(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleLanguageToggle = (language: string) => {
    setFilters(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }))
  }

  const clearFilters = () => {
    setFilters({
      userType: '',
      ageMin: 18,
      ageMax: 80,
      location: '',
      education: '',
      relationshipStatus: '',
      children: '',
      smoking: '',
      drinking: '',
      interests: [],
      languages: []
    })
    setSearchTerm('')
  }

  const getAge = (birthdate: string) => {
    return differenceInYears(new Date(), new Date(birthdate))
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Acesso negado</h2>
        <p className="mb-4">Você precisa estar logado para usar a busca avançada.</p>
        <Link href="/login" className="btn-primary">Entrar</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Busca Avançada</h1>
        <p className="text-gray-600">
          Encontre pessoas perfeitas usando nossos filtros avançados.
        </p>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, cidade, estado ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            <Filter className="w-5 h-5" />
            Filtros
          </button>
          <button
            onClick={clearFilters}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Limpar
          </button>
        </div>

        {/* Filtros Expandidos */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Tipo de Usuário */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Usuário
                </label>
                <select
                  value={filters.userType}
                  onChange={(e) => handleFilterChange('userType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Todos</option>
                  <option value="sugar_baby">Sugar Baby</option>
                  <option value="sugar_daddy">Sugar Daddy</option>
                </select>
              </div>

              {/* Faixa Etária */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idade: {filters.ageMin} - {filters.ageMax} anos
                </label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="18"
                    max="80"
                    value={filters.ageMin}
                    onChange={(e) => handleFilterChange('ageMin', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="18"
                    max="80"
                    value={filters.ageMax}
                    onChange={(e) => handleFilterChange('ageMax', parseInt(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Localização */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localização
                </label>
                <input
                  type="text"
                  placeholder="Cidade ou estado"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* Educação */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Educação
                </label>
                <select
                  value={filters.education}
                  onChange={(e) => handleFilterChange('education', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Qualquer</option>
                  <option value="ensino_medio">Ensino Médio</option>
                  <option value="tecnico">Técnico</option>
                  <option value="superior_incompleto">Superior Incompleto</option>
                  <option value="superior_completo">Superior Completo</option>
                  <option value="pos_graduacao">Pós-graduação</option>
                  <option value="mestrado">Mestrado</option>
                  <option value="doutorado">Doutorado</option>
                </select>
              </div>

              {/* Estado Civil */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado Civil
                </label>
                <select
                  value={filters.relationshipStatus}
                  onChange={(e) => handleFilterChange('relationshipStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Qualquer</option>
                  <option value="solteiro">Solteiro(a)</option>
                  <option value="divorciado">Divorciado(a)</option>
                  <option value="viuvo">Viúvo(a)</option>
                  <option value="separado">Separado(a)</option>
                </select>
              </div>

              {/* Filhos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filhos
                </label>
                <select
                  value={filters.children}
                  onChange={(e) => handleFilterChange('children', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Qualquer</option>
                  <option value="nenhum">Nenhum</option>
                  <option value="1">1 filho(a)</option>
                  <option value="2">2 filhos(as)</option>
                  <option value="3">3 filhos(as)</option>
                  <option value="mais">Mais de 3</option>
                </select>
              </div>

              {/* Fumo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fumo
                </label>
                <select
                  value={filters.smoking}
                  onChange={(e) => handleFilterChange('smoking', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Qualquer</option>
                  <option value="nao">Não fumo</option>
                  <option value="socialmente">Socialmente</option>
                  <option value="regularmente">Regularmente</option>
                </select>
              </div>

              {/* Bebida */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bebida
                </label>
                <select
                  value={filters.drinking}
                  onChange={(e) => handleFilterChange('drinking', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Qualquer</option>
                  <option value="nao">Não bebo</option>
                  <option value="socialmente">Socialmente</option>
                  <option value="regularmente">Regularmente</option>
                </select>
              </div>
            </div>

            {/* Interesses */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Interesses
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {interests.map(interest => (
                  <label key={interest} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.interests.includes(interest)}
                      onChange={() => handleInterestToggle(interest)}
                      className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">{interest}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Idiomas */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Idiomas
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {languages.map(language => (
                  <label key={language} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.languages.includes(language)}
                      onChange={() => handleLanguageToggle(language)}
                      className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">{language}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resultados */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {filteredProfiles.length} resultado{filteredProfiles.length !== 1 ? 's' : ''} encontrado{filteredProfiles.length !== 1 ? 's' : ''}
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Star className="w-4 h-4" />
            <span>Ordenado por mais recentes</span>
          </div>
        </div>
      </div>

      {/* Lista de Perfis */}
      {loadingProfiles ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfis...</p>
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Nenhum perfil encontrado</h3>
          <p className="text-gray-600 mb-4">
            Tente ajustar seus filtros ou termos de busca.
          </p>
          <button
            onClick={clearFilters}
            className="btn-primary"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProfiles.map(profile => (
            <Link key={profile.id} href={`/profile/${profile.id}`} className="group">
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative">
                  <img
                    src={profile.photoURL || '/avatar.png'}
                    alt={profile.username}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      profile.userType === 'sugar_baby' 
                        ? 'bg-pink-100 text-pink-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {profile.userType === 'sugar_baby' ? 'SB' : 'SD'}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg group-hover:text-pink-600 transition-colors">
                      {profile.username}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {getAge(profile.birthdate)} anos
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{profile.city}, {profile.state}</span>
                  </div>
                  
                  {profile.about && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {profile.about}
                    </p>
                  )}
                  
                  {profile.interests && profile.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {profile.interests.slice(0, 3).map(interest => (
                        <span
                          key={interest}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                        >
                          {interest}
                        </span>
                      ))}
                      {profile.interests.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{profile.interests.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 