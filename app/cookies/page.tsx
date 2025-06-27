import React from 'react'

export default function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Política de Cookies</h1>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
          <p className="text-orange-800">
            <strong>Última atualização:</strong> 15 de Janeiro de 2024
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. O que são Cookies?</h2>
          <p className="text-gray-700 mb-4">
            Cookies são pequenos arquivos de texto que são armazenados no seu dispositivo (computador, 
            tablet ou smartphone) quando você visita um site. Eles ajudam a melhorar sua experiência 
            de navegação e permitem que o site funcione corretamente.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Como Usamos Cookies</h2>
          <p className="text-gray-700 mb-4">
            O Bebaby App usa cookies para:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Manter você logado durante sua sessão</li>
            <li>Lembrar suas preferências e configurações</li>
            <li>Analisar como você usa nosso site</li>
            <li>Melhorar a funcionalidade e segurança</li>
            <li>Personalizar conteúdo e anúncios</li>
            <li>Fornecer recursos de mídia social</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Tipos de Cookies que Usamos</h2>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Cookies Essenciais</h3>
              <p className="text-gray-700 mb-3">
                Esses cookies são necessários para o funcionamento básico do site e não podem ser desativados.
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Autenticação e sessão de usuário</li>
                <li>Segurança e prevenção de fraudes</li>
                <li>Funcionalidades básicas do site</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Cookies de Performance</h3>
              <p className="text-gray-700 mb-3">
                Esses cookies nos ajudam a entender como os visitantes interagem com o site.
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Análise de tráfego e uso do site</li>
                <li>Identificação de problemas de performance</li>
                <li>Melhorias na experiência do usuário</li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Cookies de Funcionalidade</h3>
              <p className="text-gray-700 mb-3">
                Esses cookies permitem que o site lembre escolhas que você faz.
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Preferências de idioma e região</li>
                <li>Configurações de notificações</li>
                <li>Personalização de interface</li>
              </ul>
            </div>

            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.4 Cookies de Marketing</h3>
              <p className="text-gray-700 mb-3">
                Esses cookies são usados para rastrear visitantes em sites para exibir anúncios relevantes.
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Anúncios personalizados</li>
                <li>Redes sociais e compartilhamento</li>
                <li>Análise de campanhas publicitárias</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Cookies de Terceiros</h2>
          <p className="text-gray-700 mb-4">
            Também usamos serviços de terceiros que podem definir cookies:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li><strong>Google Analytics:</strong> Para análise de tráfego e uso do site</li>
            <li><strong>Facebook Pixel:</strong> Para publicidade e análise</li>
            <li><strong>Stripe/PayPal:</strong> Para processamento de pagamentos</li>
            <li><strong>Brevo:</strong> Para envio de e-mails</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Gerenciamento de Cookies</h2>
          <p className="text-gray-700 mb-4">
            Você pode controlar e gerenciar cookies de várias maneiras:
          </p>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Configurações do Navegador</h3>
          <p className="text-gray-700 mb-4">
            A maioria dos navegadores permite que você:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Veja quais cookies estão armazenados</li>
            <li>Exclua cookies existentes</li>
            <li>Bloqueie cookies futuros</li>
            <li>Configure alertas quando cookies são definidos</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Configurações do Bebaby App</h3>
          <p className="text-gray-700 mb-4">
            Em breve, você poderá gerenciar suas preferências de cookies diretamente em nosso site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Impacto de Desabilitar Cookies</h2>
          <p className="text-gray-700 mb-4">
            Se você desabilitar cookies, algumas funcionalidades do site podem não funcionar corretamente:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Você precisará fazer login toda vez que visitar o site</li>
            <li>Algumas preferências não serão salvas</li>
            <li>Recursos personalizados podem não funcionar</li>
            <li>A análise de uso será limitada</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Atualizações desta Política</h2>
          <p className="text-gray-700 mb-4">
            Podemos atualizar esta política de cookies periodicamente. Recomendamos que você revise 
            esta página regularmente para se manter informado sobre como usamos cookies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contato</h2>
          <p className="text-gray-700 mb-4">
            Se você tiver dúvidas sobre nossa política de cookies, entre em contato conosco em{' '}
            <a href="mailto:privacidade@bebaby.app" className="text-pink-600 hover:underline">
              privacidade@bebaby.app
            </a>
          </p>
        </section>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Como Gerenciar Cookies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">Chrome</h4>
              <p className="text-blue-600">Configurações → Privacidade e Segurança → Cookies</p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">Firefox</h4>
              <p className="text-blue-600">Opções → Privacidade e Segurança → Cookies</p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">Safari</h4>
              <p className="text-blue-600">Preferências → Privacidade → Cookies</p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">Edge</h4>
              <p className="text-blue-600">Configurações → Cookies e Permissões do Site</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Política de Cookies - Bebaby App',
  description: 'Política de cookies do Bebaby App. Saiba como usamos cookies para melhorar sua experiência.',
} 