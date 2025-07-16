const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const defaultTemplates = [
  {
    slug: 'email-confirmation',
    name: 'Confirmação de E-mail',
    subject: 'Confirme seu e-mail - BeBaby',
    body: 'Olá {{nome}},\n\nObrigado por se cadastrar no BeBaby! Para ativar sua conta, clique no link abaixo:\n\n{{link_confirmacao}}\n\nSe você não criou esta conta, ignore este e-mail.\n\nAtenciosamente,\nEquipe BeBaby',
    enabled: true
  },
  {
    slug: 'welcome',
    name: 'Bem-vindo ao site',
    subject: 'Bem-vindo ao BeBaby! 🍯',
    body: 'Olá {{nome}},\n\nSeja bem-vindo(a) ao BeBaby! Sua conta foi ativada com sucesso.\n\nAgora você pode:\n• Completar seu perfil\n• Explorar outros usuários\n• Enviar mensagens\n• Favoritar perfis\n\nComece sua jornada agora: {{link_site}}\n\nAtenciosamente,\nEquipe BeBaby',
    enabled: true
  },
  {
    slug: 'newsletter',
    name: 'Newsletter',
    subject: 'BeBaby - Suas novidades da semana',
    body: 'Olá {{nome}},\n\nConfira as novidades desta semana no BeBaby:\n\n{{conteudo_newsletter}}\n\nNão perca as oportunidades de encontrar seu match!\n\nAtenciosamente,\nEquipe BeBaby',
    enabled: false
  },
  {
    slug: 'message-received',
    name: 'Mensagem recebida',
    subject: 'Você recebeu uma nova mensagem no BeBaby',
    body: 'Olá {{nome}},\n\n{{remetente}} enviou uma mensagem para você!\n\nMensagem: {{mensagem_preview}}\n\nAcesse sua caixa de entrada para responder: {{link_mensagens}}\n\nAtenciosamente,\nEquipe BeBaby',
    enabled: true
  },
  {
    slug: 'profile-favorited',
    name: 'Perfil favoritado',
    subject: 'Alguém favoritou seu perfil no BeBaby!',
    body: 'Olá {{nome}},\n\n{{favoritador}} favoritou seu perfil!\n\nQue tal dar uma olhada no perfil dessa pessoa?\n\n{{link_perfil_favoritador}}\n\nAtenciosamente,\nEquipe BeBaby',
    enabled: true
  },
  {
    slug: 'profile-viewed',
    name: 'Perfil visualizado',
    subject: 'Alguém visualizou seu perfil no BeBaby',
    body: 'Olá {{nome}},\n\n{{visualizador}} visualizou seu perfil!\n\nQue tal dar uma olhada no perfil dessa pessoa?\n\n{{link_perfil_visualizador}}\n\nAtenciosamente,\nEquipe BeBaby',
    enabled: false
  },
  {
    slug: 'account-banned',
    name: 'Banimento de conta',
    subject: 'Sua conta foi suspensa - BeBaby',
    body: 'Olá {{nome}},\n\nSua conta foi suspensa temporariamente devido a violações dos nossos termos de uso.\n\nMotivo: {{motivo_banimento}}\n\nDuração: {{duracao_banimento}}\n\nSe você acredita que isso foi um erro, entre em contato conosco.\n\nAtenciosamente,\nEquipe BeBaby',
    enabled: true
  },
  {
    slug: 'account-deleted',
    name: 'Exclusão de conta',
    subject: 'Sua conta foi excluída - BeBaby',
    body: 'Olá {{nome}},\n\nSua conta foi excluída conforme solicitado.\n\nTodos os seus dados foram removidos permanentemente do nosso sistema.\n\nSe você mudou de ideia, você pode criar uma nova conta a qualquer momento.\n\nAtenciosamente,\nEquipe BeBaby',
    enabled: true
  }
]

async function seedEmailTemplates() {
  try {
    console.log('🌱 Populando templates de e-mail...')

    for (const template of defaultTemplates) {
      await prisma.emailTemplate.upsert({
        where: { slug: template.slug },
        update: template,
        create: template
      })
      console.log(`✅ Template "${template.name}" criado/atualizado`)
    }

    console.log('🎉 Templates de e-mail populados com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao popular templates:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedEmailTemplates() 