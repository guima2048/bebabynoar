const { PrismaClient } = require('@prisma/client');

async function setupEmailTemplates() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Configurando templates de e-mail...\n');
    
    const templates = [
      {
        slug: 'email-confirmation',
        name: 'Confirmação de E-mail',
        templateId: '', // Você precisa colocar o ID do template do SendGrid
        enabled: true,
        testEmail: '',
        testData: '{"nome":"Usuário Teste","link_confirmacao":"https://bebaby.app/verify-email?token=test&email=test@example.com"}'
      },
      {
        slug: 'welcome',
        name: 'Bem-vindo ao site',
        templateId: '', // Você precisa colocar o ID do template do SendGrid
        enabled: true,
        testEmail: '',
        testData: '{"nome":"Usuário Teste","link_site":"https://bebaby.app"}'
      },
      {
        slug: 'message-received',
        name: 'Mensagem recebida',
        templateId: '', // Você precisa colocar o ID do template do SendGrid
        enabled: true,
        testEmail: '',
        testData: '{"nome":"Usuário Teste","remetente":"Remetente Teste","mensagem_preview":"Mensagem de exemplo","link_mensagens":"https://bebaby.app/mensagens"}'
      },
      {
        slug: 'profile-favorited',
        name: 'Perfil favoritado',
        templateId: '', // Você precisa colocar o ID do template do SendGrid
        enabled: true,
        testEmail: '',
        testData: '{"nome":"Usuário Teste","favoritador":"Favoritador Teste","link_perfil_favoritador":"https://bebaby.app/perfil/favoritador"}'
      }
    ];
    
    for (const template of templates) {
      const existing = await prisma.emailTemplate.findUnique({
        where: { slug: template.slug }
      });
      
      if (existing) {
        console.log(`✅ Template "${template.name}" já existe`);
      } else {
        await prisma.emailTemplate.create({
          data: template
        });
        console.log(`✅ Template "${template.name}" criado`);
      }
    }
    
    console.log('\n🎯 Próximos passos:');
    console.log('1. Acesse /admin/emails');
    console.log('2. Configure os IDs dos templates do SendGrid');
    console.log('3. Teste o envio de e-mails');
    
  } catch (error) {
    console.error('❌ Erro ao configurar templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupEmailTemplates(); 