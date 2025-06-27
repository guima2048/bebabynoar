import React from 'react'
import Link from 'next/link'
import { Heart, Shield, Users, Star, Award, Globe, Target, Zap } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Sobre o <span className="text-pink-600">Bebaby App</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Conectando Sugar Babies e Sugar Daddies de forma segura, discreta e profissional. 
          Nossa missão é criar relacionamentos genuínos baseados em respeito mútuo e transparência.
        </p>
      </div>

      {/* Nossa História */}
      <section className="mb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Nossa História</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              O Bebaby App nasceu da necessidade de criar uma plataforma moderna e segura para 
              relacionamentos sugar no Brasil. Identificamos que o mercado carecia de uma solução 
              que priorizasse a segurança, privacidade e qualidade das conexões.
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Fundado em 2024, nosso objetivo é revolucionar a forma como Sugar Babies e Sugar Daddies 
              se conectam, oferecendo uma experiência premium com foco na autenticidade e no respeito.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Hoje, somos a plataforma de referência no Brasil, com milhares de usuários satisfeitos 
              e uma comunidade crescente de relacionamentos duradouros.
            </p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600 mb-2">10K+</div>
                <div className="text-gray-600">Usuários Ativos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">5K+</div>
                <div className="text-gray-600">Conexões Realizadas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600 mb-2">98%</div>
                <div className="text-gray-600">Satisfação</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-gray-600">Suporte</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nossa Missão */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Nossa Missão</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Criar a plataforma mais segura e confiável para relacionamentos sugar, 
            promovendo conexões autênticas e duradouras.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Conectar</h3>
            <p className="text-gray-600">
              Facilitar encontros entre pessoas que compartilham interesses e objetivos similares.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Proteger</h3>
            <p className="text-gray-600">
              Garantir a segurança e privacidade de todos os usuários da plataforma.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Inspirar</h3>
            <p className="text-gray-600">
              Promover relacionamentos baseados em respeito, transparência e crescimento mútuo.
            </p>
          </div>
        </div>
      </section>

      {/* Nossos Valores */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Nossos Valores</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Princípios que guiam tudo o que fazemos e como tratamos nossa comunidade.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Segurança</h3>
            <p className="text-sm text-gray-600">
              Proteção total da privacidade e dados dos usuários
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Respeito</h3>
            <p className="text-sm text-gray-600">
              Tratamento digno e igualitário para todos
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Qualidade</h3>
            <p className="text-sm text-gray-600">
              Excelência em todos os aspectos do serviço
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Inovação</h3>
            <p className="text-sm text-gray-600">
              Tecnologia de ponta para melhor experiência
            </p>
          </div>
        </div>
      </section>

      {/* Nossa Equipe */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Nossa Equipe</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Profissionais experientes e apaixonados por criar a melhor experiência para nossa comunidade.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">CEO</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Liderança Executiva</h3>
            <p className="text-gray-600">
              Experiência em tecnologia e relacionamentos digitais
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">DEV</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Equipe Técnica</h3>
            <p className="text-gray-600">
              Desenvolvedores especializados em segurança e UX
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">CS</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Suporte ao Cliente</h3>
            <p className="text-gray-600">
              Atendimento especializado 24/7 para nossa comunidade
            </p>
          </div>
        </div>
      </section>

      {/* Reconhecimentos */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Reconhecimentos</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nossa dedicação à excelência tem sido reconhecida pela comunidade e especialistas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Melhor App 2024</h3>
            <p className="text-sm text-gray-600">
              Prêmio de inovação em tecnologia
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Certificação de Segurança</h3>
            <p className="text-sm text-gray-600">
              Padrões internacionais de proteção
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Comunidade Ativa</h3>
            <p className="text-sm text-gray-600">
              Milhares de usuários satisfeitos
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <Globe className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Presença Nacional</h3>
            <p className="text-sm text-gray-600">
              Cobertura em todo o Brasil
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Junte-se à Nossa Comunidade</h2>
          <p className="text-xl mb-8 opacity-90">
            Faça parte da plataforma mais segura e confiável para relacionamentos sugar no Brasil.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="bg-white text-pink-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Criar Conta Grátis
            </Link>
            <Link 
              href="/contact" 
              className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-pink-600 transition-colors"
            >
              Fale Conosco
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export const metadata = {
  title: 'Sobre Nós - Bebaby App',
  description: 'Conheça a história, missão e valores do Bebaby App. A plataforma mais segura para relacionamentos sugar no Brasil.',
} 