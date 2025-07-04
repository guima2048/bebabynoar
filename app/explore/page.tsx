'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { differenceInYears } from 'date-fns'
import { Search, Heart, ChevronLeft, ChevronRight, Star, TrendingUp, Users, Crown } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { filterVisibleUsers, getUserTypeDisplayName, getUserTypeColor, getUserTypeAbbreviation, User } from '@/lib/user-matching'


interface Profile {
  id: string
  username: string
  birthdate: string
  city: string
  state: string
  userType: string
  gender?: string
  lookingFor?: string
  photoURL?: string
  about?: string
  isPremium?: boolean
  isVerified?: boolean
}

export default function ExplorePage() {
  const { user, loading, getAuthToken } = useAuth()
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(true)

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
        let allProfiles = data.profiles
        
        // Aplicar filtro baseado na lógica de matching
        const currentUser: User = {
          id: user.id,
          userType: user.userType as any,
          gender: user.gender as any || 'female',
          lookingFor: user.lookingFor as any || 'male',
          username: user.name
        }
        
        const visibleProfiles = filterVisibleUsers(currentUser, allProfiles as User[])
        setProfiles(visibleProfiles as Profile[])
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
          <p className="mb-6">Você precisa estar logado para acessar esta página.</p>
          <Link href="/login" className="btn-primary">Entrar</Link>
        </div>
      </div>
    )
  }

  function getAge(birthdate: string) {
    return differenceInYears(new Date(), new Date(birthdate))
  }

  // Categorias de perfis
  const categories = [
    {
      id: 'featured',
      title: 'Destaques',
      icon: <Star className="w-6 h-6" />,
      profiles: profiles.slice(0, 10),
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'trending',
      title: 'Em Alta',
      icon: <TrendingUp className="w-6 h-6" />,
      profiles: profiles.slice(0, 15),
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'sugar_babies',
      title: 'Sugar Babies',
      icon: <Users className="w-6 h-6" />,
      profiles: profiles.filter(p => p.userType === 'sugar_baby'),
      color: getUserTypeColor('sugar_baby')
    },
    {
      id: 'sugar_daddies',
      title: 'Sugar Daddies',
      icon: <Crown className="w-6 h-6" />,
      profiles: profiles.filter(p => p.userType === 'sugar_daddy'),
      color: getUserTypeColor('sugar_daddy')
    },
    {
      id: 'sugar_mommies',
      title: 'Sugar Mommies',
      icon: <Crown className="w-6 h-6" />,
      profiles: profiles.filter(p => p.userType === 'sugar_mommy'),
      color: getUserTypeColor('sugar_mommy')
    },
    {
      id: 'sugar_babyboys',
      title: 'Sugar Babyboys',
      icon: <Users className="w-6 h-6" />,
      profiles: profiles.filter(p => p.userType === 'sugar_babyboy'),
      color: getUserTypeColor('sugar_babyboy')
    },
    {
      id: 'premium',
      title: 'Premium',
      icon: <Crown className="w-6 h-6" />,
      profiles: profiles.filter(p => p.isPremium).slice(0, 12),
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'verified',
      title: 'Verificados',
      icon: <Star className="w-6 h-6" />,
      profiles: profiles.filter(p => p.isVerified).slice(0, 12),
      color: 'from-green-500 to-teal-500'
    }
  ]

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-[#18181b]">
      <div className="w-full lg:max-w-[35vw] lg:mx-auto flex flex-col">


        {/* Banner Carrossel */}
        {profiles.length > 0 && (
          <div className="w-full px-6 py-6">
            <div className="relative">
              <h2 className="text-xl font-bold text-white mb-4">Descubra Novos Perfis</h2>
              <BannerCarousel profiles={profiles.slice(0, 10)} getAge={getAge} />
            </div>
          </div>
        )}

        {/* Conteúdo Principal */}
        <div className="w-full px-6 py-8 space-y-12">
          {loadingProfiles ? (
            <div className="text-center py-12">
              <div className="text-white text-xl">Carregando perfis...</div>
            </div>
          ) : (
            <div className="space-y-12">
              {categories.map((category) => (
                <CategoryRow 
                  key={category.id}
                  category={category}
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

function BannerCarousel({ profiles, getAge }: { profiles: Profile[]; getAge: (birthdate: string) => number }) {
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
          className="p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Container de Cards */}
      <div 
        ref={containerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {profiles.map((profile) => (
          <BannerCard 
            key={profile.id} 
            profile={profile} 
            getAge={getAge}
          />
        ))}
      </div>
    </div>
  )
}

function BannerCard({ profile, getAge }: { profile: Profile; getAge: (birthdate: string) => number }) {
  return (
    <Link href={`/profile/${profile.id}`} className="group flex-shrink-0">
      <div className="relative w-48 h-64 bg-white/5 hover:bg-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 border border-white/10">
        {/* Imagem 3x4 */}
        <img
          src={profile.photoURL || '/avatar.png'}
          alt={profile.username}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay com gradiente igual ao perfil */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0) 35%, #18181b 100%)',
            borderBottomLeftRadius: '1rem',
            borderBottomRightRadius: '1rem',
          }}
        />
        
        {/* Informações alinhadas à direita */}
        <div className="absolute right-4 bottom-4 flex flex-col gap-1 z-10">
          {/* Nome */}
          <div className="text-right">
            <span className="text-xl font-extrabold text-white drop-shadow-lg leading-tight">
              {profile.username}
            </span>
          </div>
          
          {/* Idade, cidade, estado */}
          <div className="text-right">
            <span className="text-pink-600 text-base font-bold leading-tight">
              {getAge(profile.birthdate)} anos
              {profile.city && `, ${profile.city}`}
              {profile.state && `, ${profile.state}`}
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {profile.isPremium && (
            <div className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-white">
              Premium
            </div>
          )}
          {profile.isVerified && (
            <div className="px-2 py-1 bg-gradient-to-r from-green-500 to-teal-500 rounded-full text-xs font-bold text-white">
              ✓
            </div>
          )}
          <div className={`px-2 py-1 bg-gradient-to-r ${getUserTypeColor(profile.userType as any)} rounded-full text-xs font-bold text-white`}>
            {getUserTypeAbbreviation(profile.userType as any)}
          </div>
        </div>

        {/* Botão de Like */}
        <button className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
          <Heart className="w-5 h-5 text-white" />
        </button>
      </div>
    </Link>
  )
}

function CategoryRow({ category, getAge }: { category: any; getAge: (birthdate: string) => number }) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  if (category.profiles.length === 0) return null

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return
    const container = containerRef.current
    const scrollAmount = 280
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="relative group">
      {/* Título da Categoria */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${category.color}`}>
          {category.icon}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{category.title}</h2>
          <span className="text-gray-400 text-sm">{category.profiles.length} perfis</span>
        </div>
      </div>

      {/* Botões de Navegação */}
      <div className="absolute right-0 top-2 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={() => scroll('left')}
          className="p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Container de Cards */}
      <div 
        ref={containerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {category.profiles.map((profile: Profile) => (
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

function ProfileCard({ profile, getAge, categoryColor }: { profile: Profile; getAge: (birthdate: string) => number; categoryColor: string }) {
  return (
    <Link href={`/profile/${profile.id}`} className="group flex-shrink-0">
      <div className="w-64 bg-white/5 hover:bg-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 border border-white/10 flex flex-col">
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
              <div className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-white">
                Premium
              </div>
            )}
            {profile.isVerified && (
              <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-teal-500 rounded-full text-xs font-bold text-white">
                ✓
              </div>
            )}
            <div className={`px-3 py-1 bg-gradient-to-r ${getUserTypeColor(profile.userType as any)} rounded-full text-xs font-bold text-white`}>
              {getUserTypeAbbreviation(profile.userType as any)}
            </div>
          </div>

          {/* Botão de Like */}
          <button className="absolute bottom-4 right-4 p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
            <Heart className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Informações */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-lg mb-2 group-hover:text-white transition-colors text-white">
            {profile.username}
          </h3>
          <p className="text-gray-400 text-sm mb-3">
            {getAge(profile.birthdate)} anos • {profile.city}, {profile.state}
          </p>
          {profile.about && (
            <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed">
              {profile.about}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
} 