'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { differenceInYears } from 'date-fns'
import { Search, Heart, ChevronLeft, ChevronRight, Star, TrendingUp, Users, Crown } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { filterVisibleUsers, getUserTypeDisplayName, getUserTypeColor, getUserTypeAbbreviation, User } from '@/lib/user-matching'
import { mockProfiles, MockProfile } from '@/lib/mock-data'

export default function ExplorePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profiles, setProfiles] = useState<MockProfile[]>([])
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
      
      // Usar dados mockados em vez da API
      let allProfiles = mockProfiles
      
      // Aplicar filtro baseado na lógica de matching
      const currentUser: User = {
        id: user.id,
        userType: user.userType as any,
        gender: user.gender as any || 'female',
        lookingFor: user.lookingFor as any || 'male',
        username: user.name
      }
      
      const visibleProfiles = filterVisibleUsers(currentUser, allProfiles as User[])
      setProfiles(visibleProfiles as MockProfile[])
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