'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import DynamicImage from '@/components/DynamicImage'
import { 
  Heart, 
  Star, 
  Shield, 
  Users, 
  ArrowRight, 
  CheckCircle, 
  MapPin,
  Calendar,
  TrendingUp,
  Award,
  Zap,
  Crown,
  Sparkles,
  MessageCircle,
  Camera
} from 'lucide-react'

interface Testimonial {
  id: string;
  name: string;
  location: string;
  story: string;
  rating: number;
  photo: string;
  isActive: boolean;
}

interface ProfileCard {
  id: string;
  name: string;
  location: string;
  profession: string;
  photo: string;
  isActive: boolean;
}

interface LandingSettings {
  bannerImageURL: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerDescription: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  testimonials: Testimonial[];
  sugarBabies: ProfileCard[];
  sugarDaddies: ProfileCard[];
  heroBaby1Image?: string;
  heroDaddy1Image?: string;
  heroBaby2Image?: string;
  heroDaddy2Image?: string;
}

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [landingSettings, setLandingSettings] = useState<LandingSettings>({
    bannerImageURL: '',
    bannerTitle: 'A Maior Rede Sugar do Brasil',
    bannerSubtitle: 'Mulheres Lindas, Homens Ricos',
    bannerDescription: 'Encontre sua conexão perfeita no Bebaby App. A plataforma mais confiável e segura para Sugar Babies e Sugar Daddies encontrarem relacionamentos genuínos.',
    primaryButtonText: 'Cadastre-se Grátis',
    primaryButtonLink: '/register',
    secondaryButtonText: 'Explorar Perfis',
    secondaryButtonLink: '/explore',
    testimonials: [],
    sugarBabies: [],
    sugarDaddies: [],
    heroBaby1Image: '',
    heroDaddy1Image: '',
    heroBaby2Image: '',
    heroDaddy2Image: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const loadLandingSettings = async () => {
      try {
        const response = await fetch('/api/landing-settings', {
          headers: {
            'Cache-Control': 'max-age=300'
          }
        })
        if (response.ok) {
          const data = await response.json()
          setLandingSettings(data)
        }
      } catch (error) {
        console.error('Erro ao carregar configurações da landing page:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLandingSettings()
  }, [])

  // Filtrar apenas itens ativos
  const activeTestimonials = landingSettings.testimonials?.filter(t => t.isActive) || []
  const activeSugarBabies = landingSettings.sugarBabies?.filter(b => b.isActive) || []
  const activeSugarDaddies = landingSettings.sugarDaddies?.filter(d => d.isActive) || []

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Heart className="w-8 h-8 text-pink-500" />
              <span className="text-2xl font-bold text-gray-900">
                Bebaby
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#como-funciona" className="text-gray-600 hover:text-pink-500 transition-colors">Como Funciona</a>
              <a href="#sobre" className="text-gray-600 hover:text-pink-500 transition-colors">Sobre</a>
              <a href="#blog" className="text-gray-600 hover:text-pink-500 transition-colors">Blog</a>
              <Link href="/login" className="text-gray-600 hover:text-pink-500 transition-colors">Entrar</Link>
            </div>
            <Link 
              href="/register"
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2 rounded-full font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300"
            >
              Cadastre-se
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-50 via-white to-purple-50 py-20 lg:py-32">
        {landingSettings.bannerImageURL && (
          <div className="absolute inset-0 z-0">
            <Image
              src={landingSettings.bannerImageURL}
              alt="Banner da landing page"
              fill
              className="object-cover opacity-20"
              priority
              sizes="100vw"
              quality={75}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {landingSettings.bannerTitle}
              </h1>
              <h2 className="text-2xl lg:text-3xl font-semibold text-pink-600 mb-8">
                {landingSettings.bannerSubtitle}
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {landingSettings.bannerDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href={landingSettings.primaryButtonLink} 
                  className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  {landingSettings.primaryButtonText}
                </Link>
                <Link 
                  href={landingSettings.secondaryButtonLink} 
                  className="border-2 border-pink-500 text-pink-500 px-8 py-4 rounded-full font-semibold text-lg hover:bg-pink-50 transition-all duration-300"
                >
                  {landingSettings.secondaryButtonText}
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-8 shadow-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="relative w-16 h-16 mx-auto mb-3">
                      <DynamicImage
                        src={landingSettings.heroBaby1Image || 'hero-baby-1'}
                        alt="Sugar Baby"
                        fill
                        className="rounded-full object-cover"
                        sizes="64px"
                        quality={75}
                      />
                    </div>
                    <p className="text-center text-sm text-gray-600">Sugar Baby</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="relative w-16 h-16 mx-auto mb-3">
                      <DynamicImage
                        src={landingSettings.heroDaddy1Image || 'hero-daddy-1'}
                        alt="Sugar Daddy"
                        fill
                        className="rounded-full object-cover"
                        sizes="64px"
                        quality={75}
                      />
                    </div>
                    <p className="text-center text-sm text-gray-600">Sugar Daddy</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="relative w-16 h-16 mx-auto mb-3">
                      <DynamicImage
                        src={landingSettings.heroBaby2Image || 'hero-baby-2'}
                        alt="Sugar Baby"
                        fill
                        className="rounded-full object-cover"
                        sizes="64px"
                        quality={75}
                      />
                    </div>
                    <p className="text-center text-sm text-gray-600">Sugar Baby</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="relative w-16 h-16 mx-auto mb-3">
                      <DynamicImage
                        src={landingSettings.heroDaddy2Image || 'hero-daddy-2'}
                        alt="Sugar Daddy"
                        fill
                        className="rounded-full object-cover"
                        sizes="64px"
                        quality={75}
                      />
                    </div>
                    <p className="text-center text-sm text-gray-600">Sugar Daddy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Faça parte do Bebaby
            </h2>
            <p className="text-xl text-gray-600">
              O Bebaby já conta com milhares de usuários ativos. Entre e encontre sua Sugar Baby ou Sugar Daddy.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-500 mb-2">9.8M</div>
              <div className="text-gray-600">Sugar Babies Femininos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-500 mb-2">2M</div>
              <div className="text-gray-600">Sugar Daddies</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500 mb-2">3.6M</div>
              <div className="text-gray-600">Sugar Babies Masculinos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-500 mb-2">393K</div>
              <div className="text-gray-600">Sugar Mommies</div>
            </div>
          </div>
        </div>
      </section>

      {/* Sugar Baby Section */}
      <section className="py-16 bg-gradient-to-r from-pink-50 to-rose-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                O que é Sugar Baby?
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                <span className="font-bold">&quot;Sugar Baby&quot;</span> é um termo usado para descrever uma pessoa jovem que recebe benefícios financeiros, presentes ou apoio de alguém mais velho, conhecido como &quot;Sugar Daddy&quot; ou &quot;Sugar Mommy&quot;. Sugar Babies são mulheres jovens, bonitas e ambiciosas que buscam um relacionamento com homens mais velhos, bem-sucedidos e generosos. Elas são conhecidas por sua beleza, simpatia e talento na arte de agradar seus daddies.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-pink-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Viagens fantásticas, mimos e presentes</h3>
                    <p className="text-gray-600">Muitos Sugar Daddies gostam de viajar, assim como você.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-pink-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Estabilidade e networking</h3>
                    <p className="text-gray-600">Sugar Daddies são bem relacionados, isso pode impulsionar seu crescimento pessoal.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-pink-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Relacionamento maduros, sem joguinhos</h3>
                    <p className="text-gray-600">Encontre homens experientes e objetivos.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                {activeSugarBabies.slice(0, 2).map((baby, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <DynamicImage
                        src={baby.photo}
                        alt={baby.name}
                        fill
                        className="rounded-full object-cover"
                        sizes="80px"
                        quality={75}
                      />
                    </div>
                    <p className="text-center text-sm font-medium text-gray-900">{baby.profession}, {baby.name.split(',')[1]}</p>
                    <p className="text-center text-xs text-gray-500">{baby.location}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-4 mt-8">
                {activeSugarBabies.slice(2, 4).map((baby, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <DynamicImage
                        src={baby.photo}
                        alt={baby.name}
                        fill
                        className="rounded-full object-cover"
                        sizes="80px"
                        quality={75}
                      />
                    </div>
                    <p className="text-center text-sm font-medium text-gray-900">{baby.profession}, {baby.name.split(',')[1]}</p>
                    <p className="text-center text-xs text-gray-500">{baby.location}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sugar Daddy Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  {activeSugarDaddies.slice(0, 2).map((daddy, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="relative w-20 h-20 mx-auto mb-3">
                        <DynamicImage
                          src={daddy.photo}
                          alt={daddy.name}
                          fill
                          className="rounded-full object-cover"
                          sizes="80px"
                          quality={75}
                        />
                      </div>
                      <p className="text-center text-sm font-medium text-gray-900">{daddy.profession}, {daddy.name.split(',')[1]}</p>
                      <p className="text-center text-xs text-gray-500">{daddy.location}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-4 mt-8">
                  {activeSugarDaddies.slice(2, 4).map((daddy, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="relative w-20 h-20 mx-auto mb-3">
                        <DynamicImage
                          src={daddy.photo}
                          alt={daddy.name}
                          fill
                          className="rounded-full object-cover"
                          sizes="80px"
                          quality={75}
                        />
                      </div>
                      <p className="text-center text-sm font-medium text-gray-900">{daddy.profession}, {daddy.name.split(',')[1]}</p>
                      <p className="text-center text-xs text-gray-500">{daddy.location}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                O que é Sugar Daddy?
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Sugar Daddies são homens bem-sucedidos e com alto nível cultural que estão dispostos a oferecer estabilidade e crescimento à sua sugar baby, desde que haja uma sintonia entre os dois.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Encontre mulheres jovens, lindas e decididas</h3>
                    <p className="text-gray-600">Muitas mulheres interessantes de todos os estilos querendo te conhecer.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Relacionamento honesto e transparente</h3>
                    <p className="text-gray-600">Sempre abra o jogo sobre suas questões pessoais e profissionais.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">4x mais mulheres cadastradas que homens!</h3>
                    <p className="text-gray-600">Com certeza, você encontrará uma pessoa encantadora que combine com você.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="como-funciona" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Como funciona
            </h2>
            <p className="text-xl text-gray-600">
              Faça parte, seus desejos em um click.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Cadastro</h3>
              <p className="text-gray-600">
                Quanto mais informações sobre você, mais fácil fica. Preencha seu perfil por inteiro e não deixe de adicionar fotos reais e claras.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Escolha seu perfil</h3>
              <p className="text-gray-600">
                Selecione seu objetivo! Você é um sugar daddy/mommy ou sugar baby? Defina o que busca em um relacionamento.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Seleção</h3>
              <p className="text-gray-600">
                Todo perfil passa por uma avaliação da equipe. Queremos ter certeza que nossa comunidade é integrada por pessoas interessantes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      {activeTestimonials.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Histórias de Sucesso
              </h2>
              <p className="text-xl text-gray-600">
                Veja como o Bebaby App transformou a vida de milhares de pessoas.
              </p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8 md:p-12">
              <div className="flex items-center justify-center mb-8">
                <div className="mx-8 flex-1">
                  <div className="flex items-center justify-center mb-6">
                    <DynamicImage 
                      src={activeTestimonials[currentSlide]?.photo || '/landing/padraomulher.webp'}
                      alt={activeTestimonials[currentSlide]?.name || 'Usuário'} 
                      width={80} 
                      height={80} 
                      className="rounded-full mr-4" 
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {activeTestimonials[currentSlide]?.name || 'Usuário'}
                      </h4>
                      <p className="text-gray-500">
                        {activeTestimonials[currentSlide]?.location || 'Brasil'}
                      </p>
                      <div className="flex text-yellow-400 mt-1">
                        {[...Array(activeTestimonials[currentSlide]?.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic text-lg leading-relaxed text-center max-w-3xl mx-auto">
                    &ldquo;{activeTestimonials[currentSlide]?.story || 'O Bebaby mudou minha vida! Conheci pessoas incríveis e me sinto segura na plataforma.'}&rdquo;
                  </p>
                </div>
              </div>
              <div className="flex justify-center space-x-2">
                {activeTestimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-pink-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-pink-500 to-rose-500 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Cadastre-se hoje mesmo no Bebaby
          </h2>
          <p className="text-pink-100 text-xl mb-8 max-w-2xl mx-auto">
            E encontre pessoas que, como você, sabem o que querem e o que podem oferecer!
          </p>
          <Link 
            href="/register" 
            className="inline-block px-8 py-4 bg-white text-pink-500 rounded-full font-bold text-lg shadow-lg hover:bg-pink-50 transition-all duration-300 transform hover:scale-105"
          >
            Cadastre-se Grátis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="w-8 h-8 text-pink-500" />
                <span className="text-xl font-bold">Bebaby</span>
              </div>
              <p className="text-gray-400">
                A maior rede sugar do Brasil. Encontre sua conexão perfeita.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Sobre</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#sugar-baby" className="hover:text-white transition-colors">O que é Sugar Baby</a></li>
                <li><a href="#sugar-daddy" className="hover:text-white transition-colors">O que é Sugar Daddy</a></li>
                <li><a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a></li>
                <li><a href="#sobre" className="hover:text-white transition-colors">Sobre nós</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Atendimento</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Termos de uso</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacidade</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Blog</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/blog/dicas" className="hover:text-white transition-colors">Dicas de relacionamento</Link></li>
                <li><Link href="/blog/historias" className="hover:text-white transition-colors">Histórias de sucesso</Link></li>
                <li><Link href="/blog/novidades" className="hover:text-white transition-colors">Novidades</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Bebaby. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 
