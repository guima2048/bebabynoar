'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const testimonials = [
    {
      name: "Isabella, 24",
      location: "São Paulo",
      story: "Conheci meu Sugar Daddy há 2 anos. Hoje viajamos pelo mundo juntos e tenho uma vida que sempre sonhei.",
      rating: 5,
      photo: "/landing/testimonial-1.jpg"
    },
    {
      name: "Roberto, 45",
      location: "Rio de Janeiro", 
      story: "O Bebaby App me conectou com pessoas incríveis. A verificação de perfis me dá total segurança.",
      rating: 5,
      photo: "/landing/testimonial-2.jpg"
    },
    {
      name: "Camila, 26",
      location: "Brasília",
      story: "Em apenas 3 meses, encontrei meu parceiro ideal. A plataforma é realmente exclusiva e segura.",
      rating: 5,
      photo: "/landing/testimonial-3.jpg"
    }
  ]

  const sugarBabies = [
    {
      name: "Ana, 23",
      location: "São Paulo",
      profession: "Secretária",
      photo: "/landing/baby-1.jpg"
    },
    {
      name: "Maria, 20",
      location: "Belo Horizonte",
      profession: "Universitária",
      photo: "/landing/baby-2.jpg"
    },
    {
      name: "Julia, 25",
      location: "Florianópolis",
      profession: "Estudante",
      photo: "/landing/baby-3.jpg"
    },
    {
      name: "Sofia, 22",
      location: "Rio de Janeiro",
      profession: "Recepcionista",
      photo: "/landing/baby-4.jpg"
    }
  ]

  const sugarDaddies = [
    {
      name: "Carlos, 45",
      location: "São Paulo",
      profession: "Empresário",
      photo: "/landing/daddy-1.jpg"
    },
    {
      name: "Roberto, 52",
      location: "Rio de Janeiro",
      profession: "Advogado",
      photo: "/landing/daddy-2.jpg"
    },
    {
      name: "Dr. Paulo, 48",
      location: "Brasília",
      profession: "Médico",
      photo: "/landing/daddy-3.jpg"
    },
    {
      name: "Marcos, 50",
      location: "Belo Horizonte",
      profession: "Executivo",
      photo: "/landing/daddy-4.jpg"
    }
  ]

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                A Maior Rede Sugar do Brasil
              </h1>
              <h2 className="text-2xl lg:text-3xl font-semibold text-pink-600 mb-8">
                Mulheres Lindas, Homens Ricos
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Encontre sua conexão perfeita no Bebaby App. A plataforma mais confiável e segura para Sugar Babies e Sugar Daddies encontrarem relacionamentos genuínos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/register" 
                  className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Cadastre-se Grátis
                </Link>
                <Link 
                  href="/explore" 
                  className="border-2 border-pink-500 text-pink-500 px-8 py-4 rounded-full font-semibold text-lg hover:bg-pink-50 transition-all duration-300"
                >
                  Explorar Perfis
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-8 shadow-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="relative w-16 h-16 mx-auto mb-3">
                      <Image
                        src="/landing/hero-baby-1.jpg"
                        alt="Sugar Baby"
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <p className="text-center text-sm text-gray-600">Sugar Baby</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="relative w-16 h-16 mx-auto mb-3">
                      <Image
                        src="/landing/hero-daddy-1.jpg"
                        alt="Sugar Daddy"
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <p className="text-center text-sm text-gray-600">Sugar Daddy</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="relative w-16 h-16 mx-auto mb-3">
                      <Image
                        src="/landing/hero-baby-2.jpg"
                        alt="Sugar Baby"
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <p className="text-center text-sm text-gray-600">Sugar Baby</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="relative w-16 h-16 mx-auto mb-3">
                      <Image
                        src="/landing/hero-daddy-2.jpg"
                        alt="Sugar Daddy"
                        fill
                        className="rounded-full object-cover"
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
                {sugarBabies.slice(0, 2).map((baby, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <Image
                        src={baby.photo}
                        alt={baby.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <p className="text-center text-sm font-medium text-gray-900">{baby.profession}, {baby.name.split(',')[1]}</p>
                    <p className="text-center text-xs text-gray-500">{baby.location}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-4 mt-8">
                {sugarBabies.slice(2, 4).map((baby, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <Image
                        src={baby.photo}
                        alt={baby.name}
                        fill
                        className="rounded-full object-cover"
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
                  {sugarDaddies.slice(0, 2).map((daddy, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="relative w-20 h-20 mx-auto mb-3">
                        <Image
                          src={daddy.photo}
                          alt={daddy.name}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <p className="text-center text-sm font-medium text-gray-900">{daddy.profession}, {daddy.name.split(',')[1]}</p>
                      <p className="text-center text-xs text-gray-500">{daddy.location}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-4 mt-8">
                  {sugarDaddies.slice(2, 4).map((daddy, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="relative w-20 h-20 mx-auto mb-3">
                        <Image
                          src={daddy.photo}
                          alt={daddy.name}
                          fill
                          className="rounded-full object-cover"
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
            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Cadastro</h3>
              <p className="text-gray-600">
                Quanto mais informações sobre você, mais fácil fica. Preencha seu perfil por inteiro e não deixe de adicionar fotos reais e claras.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Escolha seu perfil</h3>
              <p className="text-gray-600">
                Selecione seu objetivo! Você é um sugar daddy/mommy ou sugar baby? Defina o que busca em um relacionamento.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Seleção</h3>
              <p className="text-gray-600">
                Todo perfil passa por uma avaliação da equipe. Queremos ter certeza que nossa comunidade é integrada por pessoas interessantes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Histórias de Sucesso
            </h2>
            <p className="text-xl text-gray-600">
              Veja como o Bebaby App transformou a vida de milhares de pessoas.
            </p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-16 h-16 mr-4">
                <Image
                  src={testimonials[currentSlide].photo}
                  alt={testimonials[currentSlide].name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">{testimonials[currentSlide].name}</p>
                <p className="text-gray-600">{testimonials[currentSlide].location}</p>
              </div>
            </div>
            <div className="flex justify-center mb-6">
              {[...Array(testimonials[currentSlide].rating)].map((_, index) => (
                <Star 
                  key={index} 
                  className="w-6 h-6 text-yellow-400 fill-current" 
                />
              ))}
            </div>
            <p className="text-lg text-gray-700 italic text-center">
              &quot;{testimonials[currentSlide].story}&quot;
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-pink-500 to-rose-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Cadastre-se hoje mesmo no Bebaby
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            E encontre pessoas que, como você, sabem o que querem e o que podem oferecer!
          </p>
          <Link 
            href="/register"
            className="inline-flex items-center bg-white text-pink-500 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <span className="flex items-center">
              Cadastre-se Grátis
              <ArrowRight className="ml-2 w-5 h-5" />
            </span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="w-6 h-6 text-pink-500" />
                <span className="text-xl font-bold">Bebaby</span>
              </div>
              <p className="text-gray-400">
                A maior rede sugar do Brasil. Encontre sua conexão perfeita.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Sobre</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">O que é Sugar Baby</a></li>
                <li><a href="#" className="hover:text-white transition-colors">O que é Sugar Daddy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Como funciona</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sobre nós</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Atendimento</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos de uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Blog</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Dicas de relacionamento</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Histórias de sucesso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Novidades</a></li>
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