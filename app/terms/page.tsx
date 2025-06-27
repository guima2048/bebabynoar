import React from 'react'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Termos de Uso</h1>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-yellow-800">
            <strong>Última atualização:</strong> 15 de Janeiro de 2024
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
          <p className="text-gray-700 mb-4">
            Ao acessar e usar o Bebaby App, você concorda em cumprir e estar vinculado a estes Termos de Uso. 
            Se você não concordar com qualquer parte destes termos, não deve usar nosso serviço.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Descrição do Serviço</h2>
          <p className="text-gray-700 mb-4">
            O Bebaby App é uma plataforma de relacionamento que conecta Sugar Babies e Sugar Daddies. 
            Nosso serviço inclui:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Criação e gerenciamento de perfis</li>
            <li>Sistema de busca e filtros</li>
            <li>Mensagens e comunicação</li>
            <li>Galeria de fotos pública e privada</li>
            <li>Sistema de notificações</li>
            <li>Blog e conteúdo educativo</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Elegibilidade</h2>
          <p className="text-gray-700 mb-4">
            Para usar o Bebaby App, você deve:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Ter pelo menos 18 anos de idade</li>
            <li>Ser capaz de formar contratos legalmente vinculativos</li>
            <li>Não estar proibido de usar o serviço por lei aplicável</li>
            <li>Fornecer informações verdadeiras e precisas</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Criação de Conta</h2>
          <p className="text-gray-700 mb-4">
            Ao criar uma conta, você concorda em:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Fornecer informações verdadeiras, precisas e completas</li>
            <li>Manter e atualizar suas informações de conta</li>
            <li>Manter a confidencialidade de sua senha</li>
            <li>Ser responsável por todas as atividades em sua conta</li>
            <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Conduta do Usuário</h2>
          <p className="text-gray-700 mb-4">
            Você concorda em não:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Usar o serviço para atividades ilegais</li>
            <li>Assediar, intimidar ou abusar de outros usuários</li>
            <li>Publicar conteúdo ofensivo, obsceno ou inadequado</li>
            <li>Usar informações falsas ou enganosas</li>
            <li>Tentar acessar contas de outros usuários</li>
            <li>Usar bots ou scripts automatizados</li>
            <li>Vender ou transferir sua conta</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Conteúdo do Usuário</h2>
          <p className="text-gray-700 mb-4">
            Você mantém a propriedade do conteúdo que envia, mas nos concede uma licença para usar, 
            modificar e distribuir esse conteúdo em conexão com o serviço.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacidade</h2>
          <p className="text-gray-700 mb-4">
            Sua privacidade é importante para nós. Consulte nossa{' '}
            <Link href="/privacy" className="text-pink-600 hover:underline">
              Política de Privacidade
            </Link>{' '}
            para entender como coletamos, usamos e protegemos suas informações.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Pagamentos e Assinaturas</h2>
          <p className="text-gray-700 mb-4">
            Alguns recursos do Bebaby App requerem uma assinatura premium. Os pagamentos são processados 
            por terceiros e estão sujeitos aos termos desses provedores.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Moderação e Suspensão</h2>
          <p className="text-gray-700 mb-4">
            Reservamo-nos o direito de moderar conteúdo, suspender ou encerrar contas que violem 
            estes termos ou nossas políticas.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitação de Responsabilidade</h2>
          <p className="text-gray-700 mb-4">
            O Bebaby App não se responsabiliza por danos indiretos, incidentais ou consequenciais 
            decorrentes do uso do serviço.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Modificações</h2>
          <p className="text-gray-700 mb-4">
            Podemos modificar estes termos a qualquer momento. As modificações entrarão em vigor 
            imediatamente após a publicação.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contato</h2>
          <p className="text-gray-700 mb-4">
            Se você tiver dúvidas sobre estes termos, entre em contato conosco em{' '}
            <a href="mailto:legal@bebaby.app" className="text-pink-600 hover:underline">
              legal@bebaby.app
            </a>
          </p>
        </section>

        <div className="bg-gray-50 rounded-lg p-6 mt-8">
          <p className="text-sm text-gray-600">
            Estes termos constituem o acordo completo entre você e o Bebaby App em relação ao uso do serviço.
          </p>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Termos de Uso - Bebaby App',
  description: 'Termos de uso da plataforma Bebaby App. Leia nossos termos e condições antes de usar o serviço.',
} 