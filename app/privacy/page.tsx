import React from 'react'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Política de Privacidade</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-blue-800">
            <strong>Última atualização:</strong> 15 de Janeiro de 2024
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introdução</h2>
          <p className="text-gray-700 mb-4">
            O Bebaby App (&quot;nós&quot;, &quot;nosso&quot;, &quot;a empresa&quot;) está comprometido em proteger sua privacidade. 
            Esta política descreve como coletamos, usamos e protegemos suas informações pessoais.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Informações que Coletamos</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Informações que você nos fornece:</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Nome de usuário e informações de conta</li>
            <li>Endereço de e-mail</li>
            <li>Data de nascimento</li>
            <li>Localização (cidade e estado)</li>
            <li>Tipo de usuário (Sugar Baby ou Sugar Daddy)</li>
            <li>Fotos e conteúdo que você envia</li>
            <li>Mensagens e comunicações</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Informações coletadas automaticamente:</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Endereço IP e informações do dispositivo</li>
            <li>Dados de uso e navegação</li>
            <li>Cookies e tecnologias similares</li>
            <li>Informações de localização (quando permitido)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Como Usamos Suas Informações</h2>
          <p className="text-gray-700 mb-4">Usamos suas informações para:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Fornecer e melhorar nossos serviços</li>
            <li>Processar pagamentos e assinaturas</li>
            <li>Enviar notificações e comunicações</li>
            <li>Personalizar sua experiência</li>
            <li>Prevenir fraudes e garantir segurança</li>
            <li>Cumprir obrigações legais</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Compartilhamento de Informações</h2>
          <p className="text-gray-700 mb-4">
            Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Com seu consentimento explícito</li>
            <li>Com provedores de serviços que nos ajudam a operar o site</li>
            <li>Para cumprir obrigações legais</li>
            <li>Para proteger nossos direitos e segurança</li>
            <li>Em caso de fusão ou aquisição da empresa</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Segurança dos Dados</h2>
          <p className="text-gray-700 mb-4">
            Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações, incluindo:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Criptografia de dados em trânsito e em repouso</li>
            <li>Controles de acesso rigorosos</li>
            <li>Monitoramento de segurança contínuo</li>
            <li>Backups regulares</li>
            <li>Treinamento de funcionários em segurança</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Seus Direitos (LGPD)</h2>
          <p className="text-gray-700 mb-4">
            Conforme a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li><strong>Acesso:</strong> Solicitar informações sobre seus dados pessoais</li>
            <li><strong>Correção:</strong> Solicitar correção de dados incorretos</li>
            <li><strong>Exclusão:</strong> Solicitar exclusão de seus dados</li>
            <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
            <li><strong>Revogação:</strong> Revogar consentimento a qualquer momento</li>
            <li><strong>Oposição:</strong> Opor-se ao processamento de seus dados</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies e Tecnologias Similares</h2>
          <p className="text-gray-700 mb-4">
            Usamos cookies e tecnologias similares para melhorar sua experiência. Consulte nossa{' '}
            <Link href="/cookies" className="text-pink-600 hover:underline">
              Política de Cookies
            </Link>{' '}
            para mais detalhes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Retenção de Dados</h2>
          <p className="text-gray-700 mb-4">
            Mantemos suas informações pessoais apenas pelo tempo necessário para fornecer nossos serviços 
            ou conforme exigido por lei. Quando você exclui sua conta, seus dados são removidos ou 
            anonimizados dentro de 30 dias.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Transferências Internacionais</h2>
          <p className="text-gray-700 mb-4">
            Seus dados podem ser processados em países fora do Brasil. Garantimos que essas transferências 
            são feitas com proteções adequadas conforme exigido pela LGPD.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Menores de Idade</h2>
          <p className="text-gray-700 mb-4">
            Nosso serviço não é destinado a menores de 18 anos. Não coletamos intencionalmente informações 
            pessoais de menores de idade. Se você é pai ou responsável e acredita que seu filho nos forneceu 
            informações pessoais, entre em contato conosco.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Alterações nesta Política</h2>
          <p className="text-gray-700 mb-4">
            Podemos atualizar esta política periodicamente. Notificaremos você sobre mudanças significativas 
            por e-mail ou através de um aviso em nosso site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contato</h2>
          <p className="text-gray-700 mb-4">
            Se você tiver dúvidas sobre esta política ou quiser exercer seus direitos, entre em contato conosco:
          </p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700">
              <strong>E-mail:</strong>{' '}
              <a href="mailto:privacidade@bebaby.app" className="text-pink-600 hover:underline">
                privacidade@bebaby.app
              </a>
            </p>
            <p className="text-gray-700">
              <strong>Encarregado de Dados (DPO):</strong>{' '}
              <a href="mailto:dpo@bebaby.app" className="text-pink-600 hover:underline">
                dpo@bebaby.app
              </a>
            </p>
          </div>
        </section>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Compromisso com a Privacidade</h3>
          <p className="text-green-700">
            Sua privacidade é fundamental para nós. Estamos comprometidos em proteger suas informações 
            e em cumprir todas as leis de proteção de dados aplicáveis.
          </p>
        </div>

        <p>Ao utilizar o Bebaby, você concorda com nossa política de privacidade. Leia atentamente para entender como suas informações são coletadas, usadas e protegidas. Caso não concorde com os termos, por favor, não utilize o Bebaby. Se tiver dúvidas, entre em contato pelo e-mail suporte@bebaby.app com o assunto &quot;Privacidade&quot;.</p>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Política de Privacidade - Bebaby App',
  description: 'Política de privacidade do Bebaby App. Saiba como protegemos suas informações pessoais.',
} 