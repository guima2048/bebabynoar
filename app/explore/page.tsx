'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getFirestoreDB } from '@/lib/firebase'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import Link from 'next/link'
import { differenceInYears } from 'date-fns'
import { Search, Filter, Heart } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Profile {
  id: string
  username: string
  birthdate: string
  city: string
  state: string
  userType: string
  photoURL?: string
  about?: string
}

export default function ExplorePage() {
  const { user, loading } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([])
  const [featuredProfiles, setFeaturedProfiles] = useState<Profile[]>([])
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'sugar_baby' | 'sugar_daddy'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingProfiles, setLoadingProfiles] = useState(true)

  const fetchProfiles = async () => {
    if (!user) { return }
    
    try {
      setLoadingProfiles(true)
      const response = await fetch('/api/explore')
      if (response.ok) {
        const data = await response.json()
        const allProfiles = data.profiles.filter((profile: Profile) => profile.id !== user.id)
        setProfiles(allProfiles)
        setFeaturedProfiles(allProfiles.slice(0, 6))
      }
    } catch (err) {
      toast.error('Erro ao carregar perfis')
    } finally {
      setLoadingProfiles(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [user])

  useEffect(() => {
    let filtered = profiles

    // Filtro por tipo de usuário
    if (userTypeFilter !== 'all') {
      filtered = filtered.filter(profile => profile.userType === userTypeFilter)
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(profile =>
        profile.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.state.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredProfiles(filtered)
  }, [profiles, userTypeFilter, searchTerm])

  if (loading) { return <div className="text-center py-12">Carregando...</div> }
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Acesso negado</h2>
        <p className="mb-4">Você precisa estar logado para explorar perfis.</p>
        <Link href="/login" className="btn-primary">Entrar</Link>
      </div>
    )
  }

  function getAge(birthdate: string) {
    return differenceInYears(new Date(), new Date(birthdate))
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Explorar Perfis</h1>

      {/* Filtros e Busca */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, cidade ou estado..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg border transition-colors ${
                userTypeFilter === 'all' ? 'bg-primary-600 text-white border-primary-600' : 'border-secondary-300 text-secondary-700 hover:bg-secondary-50'
              }`}
              onClick={() => setUserTypeFilter('all')}
            >
              Todos
            </button>
            <button
              className={`px-4 py-2 rounded-lg border transition-colors ${
                userTypeFilter === 'sugar_baby' ? 'bg-primary-600 text-white border-primary-600' : 'border-secondary-300 text-secondary-700 hover:bg-secondary-50'
              }`}
              onClick={() => setUserTypeFilter('sugar_baby')}
            >
              Sugar Babies
            </button>
            <button
              className={`px-4 py-2 rounded-lg border transition-colors ${
                userTypeFilter === 'sugar_daddy' ? 'bg-primary-600 text-white border-primary-600' : 'border-secondary-300 text-secondary-700 hover:bg-secondary-50'
              }`}
              onClick={() => setUserTypeFilter('sugar_daddy')}
            >
              Sugar Daddies
            </button>
          </div>
        </div>
      </div>

      {/* Perfis em Destaque */}
      {featuredProfiles.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Perfis em Destaque</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProfiles.slice(0, 6).map(profile => (
              <ProfileCard key={profile.id} profile={profile} getAge={getAge} />
            ))}
          </div>
        </div>
      )}

      {/* Lista de Perfis */}
      <div>
        <h2 className="text-2xl font-bold mb-6">
          {userTypeFilter === 'all' ? 'Todos os Perfis' : 
           userTypeFilter === 'sugar_baby' ? 'Sugar Babies' : 'Sugar Daddies'}
          {searchTerm && ` - "${searchTerm}"`}
        </h2>
        
        {loadingProfiles ? (
          <div className="text-center py-12">Carregando perfis...</div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-12 text-secondary-600">
            Nenhum perfil encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProfiles.map(profile => (
              <ProfileCard key={profile.id} profile={profile} getAge={getAge} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProfileCard({ profile, getAge }: { profile: Profile; getAge: (birthdate: string) => number }) {
  return (
    <Link href={`/profile/${profile.id}`} className="group">
      <div className="card hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative mb-4">
          <img
            src={profile.photoURL || '/avatar.png'}
            alt={profile.username}
            className="w-full h-48 object-cover rounded-lg"
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
        <div>
          <h3 className="font-semibold text-lg mb-1 group-hover:text-primary-600 transition-colors">
            {profile.username}
          </h3>
          <p className="text-secondary-600 text-sm mb-2">
            {getAge(profile.birthdate)} anos • {profile.city}, {profile.state}
          </p>
          {profile.about && (
            <p className="text-secondary-700 text-sm line-clamp-2">
              {profile.about}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
} 