'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, MapPin, Filter, Users, Heart, MessageCircle, Crown, Star, X, Sliders } from 'lucide-react'
import toast from 'react-hot-toast'
import SidebarMenuWrapper from '@/components/SidebarMenuWrapper';

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

interface AuthUser { id: string; username?: string; userType?: string; [key: string]: any }

function sanitizeText(text: string) {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default function SearchPage() {
  const { data: session, status } = useSession()
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
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated' && session?.user) {
      performSearch(session.user)
    }
  }, [status, session, router])

  const performSearch = async (user: any) => {
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
      const response = await fetch(`/api/explore?${params}`, {
        headers: {
          'x-user-id': user.id
        }
      })
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
    if (!session?.user) {
      toast.error('Você precisa estar logado')
      return
    }

    try {
      const response = await fetch('/api/send-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: session.user.id,
          targetId: targetId
        })
      })

      if (response.ok) {
        toast.success('Interesse enviado com sucesso!')
        performSearch(session.user) // Recarregar resultados
      } else {
        toast.error('Erro ao enviar interesse')
      }
    } catch (error) {
      toast.error('Erro ao enviar interesse')
    }
  }

  const handleSendMessage = async (targetId: string) => {
    if (!session?.user) {
      toast.error('Você precisa estar logado')
      return
    }

    try {
      const response = await fetch('/api/start-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: session.user.id,
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }
  if (status === 'unauthenticated' || !session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  console.log('session', session?.user)
  console.log('status', status)

  return (
    <div className="min-h-screen bg-[#18181b] flex flex-col md:flex-row">
      {/* Sidebar: topo no mobile, lateral no desktop */}
      <div className="w-full md:w-64 flex-shrink-0 md:h-auto md:block sticky top-0 z-20 bg-[#18181b] border-b border-gray-800 md:border-b-0 md:border-r">
        <SidebarMenuWrapper />
      </div>
      <main className="flex-1 w-full max-w-4xl mx-auto py-4 px-2 sm:px-4 md:py-12 md:px-8">
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Busca Avançada</h1>
          <p className="text-gray-400 text-sm md:text-base">Encontre perfis com filtros detalhados</p>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 md:grid-cols-3 md:gap-4 mb-4 md:mb-8">
          <div className="bg-[#232326] rounded-lg p-2 md:p-4 border border-gray-700 flex flex-col items-center">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-pink-600/20 rounded-lg flex items-center justify-center mb-1 md:mb-0">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-pink-500" />
            </div>
            <p className="text-xs md:text-sm text-gray-400">Resultados</p>
            <p className="text-lg md:text-2xl font-bold text-white">{stats.totalResults}</p>
          </div>
          <div className="bg-[#232326] rounded-lg p-2 md:p-4 border border-gray-700 flex flex-col items-center">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-600/20 rounded-lg flex items-center justify-center mb-1 md:mb-0">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
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
        {/* Search Bar e Filtros */}
        <div className="bg-[#232326] rounded-lg p-2 md:p-4 mb-4 md:mb-8 border border-gray-700">
          <div className="flex flex-col gap-2 md:flex-row md:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <input
                type="text"
                placeholder="Buscar por nome, cidade, interesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-2 py-2 md:pl-10 md:pr-4 md:py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-pink-400 focus:border-pink-600 text-white placeholder-gray-200 text-sm md:text-base"
                aria-label="Buscar por nome, cidade, interesses"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-white focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none text-sm md:text-base"
              aria-label="Abrir filtros de busca"
            >
              <Filter className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <span className="text-gray-300">Filtros</span>
            </button>
          </div>
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-600">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-4 md:gap-4">
                {/* Tipo de Usuário */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1 md:mb-2">Tipo de Usuário</label>
                  <select
                    value={filters.userType}
                    onChange={(e) => handleFilterChange('userType', e.target.value)}
                    className="w-full px-2 py-2 md:px-3 md:py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-pink-400 text-white placeholder-gray-200 text-xs md:text-base"
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
                  <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1 md:mb-2">Idade</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.ageMin}
                      onChange={(e) => handleFilterChange('ageMin', parseInt(e.target.value))}
                      className="w-1/2 px-2 py-2 md:px-3 md:py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-pink-400 text-white placeholder-gray-200 text-xs md:text-base"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.ageMax}
                      onChange={(e) => handleFilterChange('ageMax', parseInt(e.target.value))}
                      className="w-1/2 px-2 py-2 md:px-3 md:py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-pink-400 text-white placeholder-gray-200 text-xs md:text-base"
                    />
                  </div>
                </div>
                {/* Estado */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1 md:mb-2">Estado</label>
                  <select
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                    className="w-full px-2 py-2 md:px-3 md:py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-pink-400 text-white placeholder-gray-200 text-xs md:text-base"
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
                  <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1 md:mb-2">Cidade</label>
                  <input
                    type="text"
                    placeholder="Digite a cidade"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full px-2 py-2 md:px-3 md:py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-pink-400 text-white placeholder-gray-200 text-xs md:text-base"
                  />
                </div>
              </div>
              {/* Filtros Adicionais */}
              <div className="mt-4 flex flex-wrap items-center gap-2 md:gap-4">
                <label className="flex items-center gap-2 text-xs md:text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={filters.onlineOnly}
                    onChange={(e) => handleFilterChange('onlineOnly', e.target.checked)}
                    className="rounded border-gray-600 text-pink-600 focus:ring-pink-500"
                  />
                  Apenas online
                </label>
                <label className="flex items-center gap-2 text-xs md:text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={filters.premiumOnly}
                    onChange={(e) => handleFilterChange('premiumOnly', e.target.checked)}
                    className="rounded border-gray-600 text-pink-600 focus:ring-pink-500"
                  />
                  Apenas premium
                </label>
                <label className="flex items-center gap-2 text-xs md:text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={filters.withPhotos}
                    onChange={(e) => handleFilterChange('withPhotos', e.target.checked)}
                    className="rounded border-gray-600 text-pink-600 focus:ring-pink-500"
                  />
                  Com fotos
                </label>
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-3 py-2 text-xs md:text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                  Limpar filtros
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Resultados */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Buscando usuários...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-[#232326] rounded-lg p-6 md:p-8 text-center border border-gray-700">
            <Users className="w-12 h-12 md:w-16 md:h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-semibold text-white mb-2">Nenhum resultado encontrado</h3>
            <p className="text-gray-400 text-sm md:text-base mb-4">Tente ajustar os filtros ou termos de busca</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm md:text-base"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 md:gap-6">
            {results.map((result) => (
              <div key={result.id} className="bg-[#232326] rounded-lg border border-gray-700 overflow-hidden hover:bg-gray-800 transition-colors">
                {/* Profile Image */}
                <div className="relative h-40 md:h-48 bg-gray-700">
                  {result.photoURL ? (
                    <Image
                      src={result.photoURL}
                      alt={sanitizeText(result.name)}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="w-8 h-8 md:w-12 md:h-12 text-gray-400" />
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-2 left-2 md:top-3 md:left-3 flex gap-2">
                    {result.premium && (
                      <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
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
                    <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                      {result.distance}km
                    </div>
                  )}
                </div>
                {/* Profile Info */}
                <div className="p-3 md:p-4">
                  <div className="flex items-center justify-between mb-1 md:mb-2">
                    <h3 className="font-semibold text-white truncate text-base md:text-lg">{sanitizeText(result.name)}</h3>
                    <span className="text-xs md:text-sm text-gray-400">{result.age} anos</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs md:text-sm text-gray-400 mb-1 md:mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{sanitizeText(result.city)}, {sanitizeText(result.state)}</span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-4 line-clamp-2">
                    {sanitizeText(result.about || '') || 'Nenhuma descrição disponível'}
                  </p>
                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSendInterest(result.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-pink-600 text-white py-2 px-2 md:px-4 rounded-lg hover:bg-pink-700 transition-colors text-xs md:text-base"
                    >
                      <Heart className="w-4 h-4" />
                      <span>Interesse</span>
                    </button>
                    <button
                      onClick={() => handleSendMessage(result.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600/20 text-blue-500 py-2 px-2 md:px-4 rounded-lg hover:bg-blue-600/30 transition-colors text-xs md:text-base"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Mensagem</span>
                    </button>
                  </div>
                  {/* View Profile */}
                  <Link
                    href={`/profile/${result.id}`}
                    className="block w-full text-center mt-2 md:mt-3 text-pink-600 hover:text-pink-700 text-xs md:text-sm font-medium"
                  >
                    Ver perfil completo
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 