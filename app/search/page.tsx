'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, MapPin, Filter, Users, Heart, MessageCircle, Crown, Star, X, Sliders } from 'lucide-react'
import toast from 'react-hot-toast'

interface SearchResult {
  id: string
  username: string
  name: string
  age: number
  city: string
  state: string
  userType: string
  photoURL?: string
  about?: string
  premium: boolean
  online: boolean
  lastSeen: string
  distance?: number
}

interface SearchFilters {
  userType: string
  ageMin: number
  ageMax: number
  state: string
  city: string
  onlineOnly: boolean
  premiumOnly: boolean
  withPhotos: boolean
  distance: number
}

const estados = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' },
]

export default function SearchPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({
    userType: '',
    ageMin: 18,
    ageMax: 65,
    state: '',
    city: '',
    onlineOnly: false,
    premiumOnly: false,
    withPhotos: false,
    distance: 50
  })
  const [stats, setStats] = useState({
    totalResults: 0,
    onlineUsers: 0,
    premiumUsers: 0
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (user) {
      performSearch()
    }
  }, [user, authLoading, router])

  const performSearch = async () => {
    if (!user) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        userType: filters.userType,
        ageMin: filters.ageMin.toString(),
        ageMax: filters.ageMax.toString(),
        state: filters.state,
        city: filters.city,
        onlineOnly: filters.onlineOnly.toString(),
        premiumOnly: filters.premiumOnly.toString(),
        withPhotos: filters.withPhotos.toString(),
        distance: filters.distance.toString()
      })

      const response = await fetch(`/api/explore?${params}`)
      const data = await response.json()

      if (response.ok) {
        setResults(data.users || [])
        setStats({
          totalResults: data.users?.length || 0,
          onlineUsers: data.onlineUsers || 0,
          premiumUsers: data.premiumUsers || 0
        })
      } else {
        toast.error('Erro ao buscar usuários')
      }
    } catch (error) {
      toast.error('Erro ao buscar usuários')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      userType: '',
      ageMin: 18,
      ageMax: 65,
      state: '',
      city: '',
      onlineOnly: false,
      premiumOnly: false,
      withPhotos: false,
      distance: 50
    })
  }

  const handleSendInterest = async (targetId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado')
      return
    }

    try {
      const response = await fetch('/api/send-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: user.id,
          targetId: targetId
        })
      })

      if (response.ok) {
        toast.success('Interesse enviado com sucesso!')
        performSearch() // Recarregar resultados
      } else {
        toast.error('Erro ao enviar interesse')
      }
    } catch (error) {
      toast.error('Erro ao enviar interesse')
    }
  }

  const handleSendMessage = async (targetId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado')
      return
    }

    try {
      const response = await fetch('/api/start-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: user.id,
          targetId: targetId
        })
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/messages/${data.conversationId}`)
      } else {
        toast.error('Erro ao iniciar conversa')
      }
    } catch (error) {
      toast.error('Erro ao iniciar conversa')
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Search className="w-6 h-6 text-pink-500" />
              <h1 className="text-xl font-bold text-gray-900">Busca Avançada</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                <Sliders className="w-4 h-4" />
                <span>Filtros</span>
              </button>
              <Link
                href="/explore"
                className="text-gray-600 hover:text-pink-500 transition-colors"
              >
                Voltar
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome, cidade, interesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={performSearch}
              className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Tipo de Usuário */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Usuário</label>
                <select
                  value={filters.userType}
                  onChange={(e) => handleFilterChange('userType', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Todos os tipos</option>
                  <option value="SUGAR_BABY">Sugar Baby</option>
                  <option value="SUGAR_DADDY">Sugar Daddy</option>
                  <option value="SUGAR_MOMMY">Sugar Mommy</option>
                  <option value="SUGAR_BABYBOY">Sugar Baby Boy</option>
                </select>
              </div>

              {/* Faixa Etária */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Idade</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.ageMin}
                    onChange={(e) => handleFilterChange('ageMin', parseInt(e.target.value))}
                    className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.ageMax}
                    onChange={(e) => handleFilterChange('ageMax', parseInt(e.target.value))}
                    className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={filters.state}
                  onChange={(e) => handleFilterChange('state', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Todos os estados</option>
                  {estados.map((estado) => (
                    <option key={estado.sigla} value={estado.sigla}>
                      {estado.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cidade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                <input
                  type="text"
                  placeholder="Digite a cidade"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtros Adicionais */}
            <div className="mt-4 flex flex-wrap items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.onlineOnly}
                  onChange={(e) => handleFilterChange('onlineOnly', e.target.checked)}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">Apenas online</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.premiumOnly}
                  onChange={(e) => handleFilterChange('premiumOnly', e.target.checked)}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">Apenas premium</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.withPhotos}
                  onChange={(e) => handleFilterChange('withPhotos', e.target.checked)}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">Com fotos</span>
              </label>

              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Limpar filtros</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-6">
              <span>{stats.totalResults} resultados encontrados</span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{stats.onlineUsers} online</span>
              </span>
              <span className="flex items-center space-x-1">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span>{stats.premiumUsers} premium</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Buscando usuários...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum resultado encontrado</h3>
            <p className="text-gray-600 mb-4">Tente ajustar os filtros ou termos de busca</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => (
              <div key={result.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Profile Image */}
                <div className="relative h-48 bg-gray-200">
                  {result.photoURL ? (
                    <Image
                      src={result.photoURL}
                      alt={result.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex space-x-2">
                    {result.premium && (
                      <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                        <Crown className="w-3 h-3" />
                        <span>Premium</span>
                      </div>
                    )}
                    {result.online && (
                      <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Online
                      </div>
                    )}
                  </div>

                  {/* Distance */}
                  {result.distance && (
                    <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                      {result.distance}km
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{result.name}</h3>
                    <span className="text-gray-500">{result.age} anos</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{result.city}, {result.state}</span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {result.about || 'Nenhuma descrição disponível'}
                  </p>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSendInterest(result.id)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      <span>Interesse</span>
                    </button>
                    <button
                      onClick={() => handleSendMessage(result.id)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Mensagem</span>
                    </button>
                  </div>

                  {/* View Profile */}
                  <Link
                    href={`/profile/${result.id}`}
                    className="block w-full text-center mt-3 text-pink-600 hover:text-pink-700 text-sm font-medium"
                  >
                    Ver perfil completo
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 