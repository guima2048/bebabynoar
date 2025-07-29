const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Populando templates de e-mail...');

  const templates = [
    {
      slug: 'email-confirmation',
      name: 'Confirmação de E-mail',
      templateId: 'd-02ad9af399aa4687a4827baa6cb694f3', // ID do seu template SendGrid
      enabled: true,
      testEmail: 'antoniog2048@gmail.com',
      testData: '{"nome":"Usuário Teste","link_confirmacao":"https://bebaby.app/confirm"}'
    },
    {
      slug: 'welcome',
      name: 'Bem-vindo ao site',
      templateId: '', // Adicione o ID do template de boas-vindas se tiver
      enabled: true,
      testEmail: 'antoniog2048@gmail.com',
      testData: '{"nome":"Usuário Teste","link_site":"https://bebaby.app"}'
    }
  ];

  for (const template of templates) {
    try {
      const result = await prisma.emailTemplate.upsert({
        where: { slug: template.slug },
        update: template,
        create: template,
      });
      
      console.log(`✅ Template "${template.name}" ${result.id ? 'atualizado' : 'criado'}:`, {
        slug: result.slug,
        enabled: result.enabled,
        hasTemplateId: !!result.templateId
      });
    } catch (error) {
      console.error(`❌ Erro ao salvar template "${template.name}":`, error.message);
    }
  }

  console.log('🎉 Templates populados com sucesso!');
}

main()
  .catch(e => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect()); 