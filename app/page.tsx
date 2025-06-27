import React from 'react'
import Link from 'next/link'
import { Heart, Shield, Users, Star, ArrowRight, MessageCircle, Camera, Crown, CheckCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Temporary Test Link */}
      <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black py-2 text-center">
        <Link href="/landing-test" className="font-semibold hover:underline">
          🎨 Ver Nova Landing Page Premium (Teste)
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-600 via-purple-600 to-pink-700 text-white py-20 lg:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm border border-white/30">
                <Heart className="w-4 h-4 mr-2" />
                Plataforma #1 em Relacionamentos Sugar
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Encontre Sua
              <span className="block bg-gradient-to-r from-pink-200 to-purple-200 bg-clip-text text-transparent">
                Conexão Perfeita
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-pink-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              O Bebaby App é a plataforma mais moderna e segura para Sugar Babies e Sugar Daddies 
              encontrarem relacionamentos genuínos e duradouros.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="/register" 
                className="group bg-white text-pink-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-pink-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center justify-center">
                  Começar Agora
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link 
                href="/explore" 
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-pink-600 transition-all duration-300 transform hover:scale-105"
              >
                Explorar Perfis
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-pink-200">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                <span>100% Seguro</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                <span>10K+ Usuários</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Verificado</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Por que escolher o 
              <span className="text-pink-600"> Bebaby App</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Oferecemos a melhor experiência para encontrar conexões genuínas e duradouras, 
              com segurança e privacidade garantidas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                Segurança Total
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Sua privacidade é nossa prioridade. Perfis verificados, 
                moderação ativa e ambiente 100% seguro.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                Comunidade Premium
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Conecte-se com pessoas reais e interessantes que compartilham 
                seus objetivos e valores.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                Conexões Autênticas
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Encontre relacionamentos significativos baseados em 
                compatibilidade real e interesses compartilhados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-pink-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform">10K+</div>
              <div className="text-pink-200 font-medium">Usuários Ativos</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform">5K+</div>
              <div className="text-pink-200 font-medium">Conexões Realizadas</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform">98%</div>
              <div className="text-pink-200 font-medium">Satisfação</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform">24/7</div>
              <div className="text-pink-200 font-medium">Suporte</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Como funciona?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Em apenas 3 passos simples, você pode começar sua jornada para encontrar a conexão perfeita.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold group-hover:scale-110 transition-transform">
                  1
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  <Crown className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Crie Seu Perfil</h3>
              <p className="text-gray-600 leading-relaxed">
                Cadastre-se gratuitamente e crie um perfil atrativo com suas melhores fotos e interesses.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Explore Perfis</h3>
              <p className="text-gray-600 leading-relaxed">
                Use nossos filtros avançados para encontrar pessoas que combinam com seus interesses.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Conecte-se</h3>
              <p className="text-gray-600 leading-relaxed">
                Envie mensagens, demonstre interesse e construa relacionamentos significativos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              O que nossos usuários dizem
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Histórias reais de pessoas que encontraram conexões incríveis através do Bebaby App.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                &quot;O Bebaby App mudou minha vida completamente. Encontrei uma conexão incrível e estamos juntos há mais de um ano. A plataforma é muito segura e profissional.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full mr-4"></div>
                <div>
                  <div className="font-semibold text-gray-900">Maria, 25</div>
                  <div className="text-sm text-pink-600 font-medium">Sugar Baby</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                &quot;Plataforma muito profissional e segura. A interface é intuitiva e a comunidade é de alta qualidade. Recomendo para quem busca relacionamentos sérios.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mr-4"></div>
                <div>
                  <div className="font-semibold text-gray-900">João, 42</div>
                  <div className="text-sm text-purple-600 font-medium">Sugar Daddy</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                &quot;Interface intuitiva e comunidade incrível. O sistema de verificação me deixa muito mais segura. Valeu muito a pena se cadastrar!&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full mr-4"></div>
                <div>
                  <div className="font-semibold text-gray-900">Ana, 28</div>
                  <div className="text-sm text-pink-600 font-medium">Sugar Baby</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-pink-600 via-purple-600 to-pink-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto para encontrar sua conexão perfeita?
          </h2>
          <p className="text-xl text-pink-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Junte-se a milhares de pessoas que já encontraram relacionamentos significativos 
            e duradouros no Bebaby App.
          </p>
          <Link 
            href="/register" 
            className="group bg-white text-pink-600 px-10 py-5 rounded-xl font-semibold text-xl hover:bg-pink-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center"
          >
            <span className="flex items-center">
              Criar Conta Grátis
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          
          <p className="text-pink-200 mt-6 text-sm">
            ✓ Cadastro gratuito • ✓ Perfil completo • ✓ Chat ilimitado • ✓ Suporte 24/7
          </p>
        </div>
      </section>
    </div>
  )
} 