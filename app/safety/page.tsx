import React from 'react'
import { Shield, AlertTriangle, Heart, Users, Lock, Eye, MessageCircle, Camera } from 'lucide-react'

export default function SafetyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Shield className="w-12 h-12 text-pink-600" />
          <h1 className="text-4xl font-bold text-gray-900">Dicas de Segurança</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Sua segurança é nossa prioridade. Siga estas dicas para uma experiência segura e positiva no Bebaby App.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Proteção de Informações Pessoais */}
        <section className="bg-white rounded-xl shadow-sm border p-8">
          <div className="flex items-center gap-4 mb-6">
            <Lock className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Proteção de Informações Pessoais</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">✅ O que fazer:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Use um nome de usuário único, não seu nome real</li>
                <li>• Não compartilhe endereço residencial inicialmente</li>
                <li>• Use um e-mail dedicado para o app</li>
                <li>• Configure privacidade das redes sociais</li>
                <li>• Use fotos que não revelem sua localização</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-red-600">❌ O que evitar:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Compartilhar documentos pessoais</li>
                <li>• Revelar informações financeiras</li>
                <li>• Usar fotos com placas de carro visíveis</li>
                <li>• Compartilhar localização exata</li>
                <li>• Usar senhas fracas ou óbvias</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Primeiro Encontro */}
        <section className="bg-white rounded-xl shadow-sm border p-8">
          <div className="flex items-center gap-4 mb-6">
            <Users className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Primeiro Encontro</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">✅ Recomendações:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Sempre encontre em local público</li>
                <li>• Informe um amigo sobre o encontro</li>
                <li>• Use transporte próprio ou Uber</li>
                <li>• Mantenha o celular carregado</li>
                <li>• Confie nos seus instintos</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-red-600">❌ Evite:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Encontros em locais isolados</li>
                <li>• Aceitar carona de estranhos</li>
                <li>• Consumir bebidas não seladas</li>
                <li>• Ir para casa de alguém no primeiro encontro</li>
                <li>• Ignorar sinais de alerta</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Comunicação Segura */}
        <section className="bg-white rounded-xl shadow-sm border p-8">
          <div className="flex items-center gap-4 mb-6">
            <MessageCircle className="w-8 h-8 text-purple-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Comunicação Segura</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Sinais de Alerta na Comunicação:</h3>
              <ul className="space-y-2 text-blue-700">
                <li>• Pressão para encontros imediatos</li>
                <li>• Pedidos de dinheiro ou favores financeiros</li>
                <li>• Histórias inconsistentes ou dramáticas</li>
                <li>• Evasão de perguntas diretas</li>
                <li>• Comportamento excessivamente agressivo ou passivo</li>
                <li>• Tentativas de isolar você de amigos/família</li>
              </ul>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Comunicação Saudável:</h3>
              <ul className="space-y-2 text-green-700">
                <li>• Respeito mútuo e limites claros</li>
                <li>• Comunicação honesta e transparente</li>
                <li>• Tempo para conhecer a pessoa</li>
                <li>• Expectativas realistas</li>
                <li>• Consentimento explícito em todas as situações</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Fotos e Conteúdo */}
        <section className="bg-white rounded-xl shadow-sm border p-8">
          <div className="flex items-center gap-4 mb-6">
            <Camera className="w-8 h-8 text-orange-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Fotos e Conteúdo</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">✅ Dicas para Fotos:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Use fotos recentes e autênticas</li>
                <li>• Mostre seu rosto claramente</li>
                <li>• Evite filtros excessivos</li>
                <li>• Não inclua informações pessoais</li>
                <li>• Respeite os limites de outros usuários</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-red-600">❌ Evite:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Enviar fotos íntimas sem confiança</li>
                <li>• Usar fotos de outras pessoas</li>
                <li>• Fotos com crianças ou menores</li>
                <li>• Conteúdo ofensivo ou inadequado</li>
                <li>• Pressão para troca de fotos íntimas</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Denúncias e Suporte */}
        <section className="bg-white rounded-xl shadow-sm border p-8">
          <div className="flex items-center gap-4 mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Denúncias e Suporte</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-red-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-3">Quando Denunciar:</h3>
              <ul className="space-y-2 text-red-700">
                <li>• Comportamento abusivo ou assédio</li>
                <li>• Solicitações de dinheiro ou favores</li>
                <li>• Perfis falsos ou enganosos</li>
                <li>• Conteúdo inadequado ou ofensivo</li>
                <li>• Comportamento ilegal ou suspeito</li>
                <li>• Menores de idade no app</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Como Denunciar:</h3>
              <ul className="space-y-2 text-blue-700">
                <li>• Use o botão &quot;Denunciar&quot; no perfil ou mensagem</li>
                <li>• Forneça detalhes específicos sobre o incidente</li>
                <li>• Salve evidências (prints, mensagens)</li>
                <li>• Entre em contato com nosso suporte</li>
                <li>• Em casos graves, procure autoridades</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Recursos de Segurança */}
        <section className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <Heart className="w-8 h-8 text-pink-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Recursos de Segurança do Bebaby</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Ferramentas Disponíveis:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Sistema de verificação de perfis</li>
                <li>• Moderação 24/7 de conteúdo</li>
                <li>• Sistema de denúncias rápido</li>
                <li>• Bloqueio de usuários</li>
                <li>• Controle de privacidade avançado</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Suporte:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Equipe de segurança dedicada</li>
                <li>• Resposta rápida a denúncias</li>
                <li>• Parceria com autoridades</li>
                <li>• Recursos educativos</li>
                <li>• Comunidade de apoio</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contatos de Emergência */}
        <section className="bg-white rounded-xl shadow-sm border p-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contatos de Emergência</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">Polícia</h3>
                <p className="text-red-700">190</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Bebaby Suporte</h3>
                <p className="text-blue-700">suporte@bebaby.app</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Centro de Apoio</h3>
                <p className="text-green-700">180 (Violência contra Mulher)</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-12 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Lembre-se</h3>
          <p className="text-yellow-700">
            Sua segurança é mais importante que qualquer relacionamento. Sempre confie nos seus instintos 
            e não hesite em denunciar comportamentos suspeitos.
          </p>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Dicas de Segurança - Bebaby App',
  description: 'Dicas de segurança para usuários do Bebaby App. Aprenda como se proteger e ter uma experiência segura.',
} 