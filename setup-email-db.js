// Script simples para configurar email no banco
const { PrismaClient } = require('@prisma/client');

async function setupEmail() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Configurando email no banco de dados...');
    
    const config = {
      from: 'bebaby@bebaby.app',
      apiKey: process.env.SENDGRID_API_KEY || '',
    };
    
    console.log('📧 Configuração:', {
      from: config.from,
      hasApiKey: !!config.apiKey,
      apiKeyLength: config.apiKey.length
    });
    
    // Verificar se já existe
    const existing = await prisma.emailConfig.findFirst();
    
    if (existing) {
      await prisma.emailConfig.update({
        where: { id: existing.id },
        data: config,
      });
      console.log('✅ Configuração atualizada com sucesso!');
    } else {
      await prisma.emailConfig.create({
        data: config,
      });
      console.log('✅ Configuração criada com sucesso!');
    }
    
    // Verificar template
    const template = await prisma.emailTemplate.findUnique({
      where: { slug: 'email-confirmation' }
    });
    
    if (!template) {
      await prisma.emailTemplate.create({
        data: {
          slug: 'email-confirmation',
          name: 'Confirmação de E-mail',
          templateId: 'd-02ad9af399aa4687a4827baa6cb694f3',
          enabled: true,
          testEmail: 'test@example.com',
          testData: '{"nome":"Usuário Teste","link_confirmacao":"https://bebaby.app/confirm"}'
        }
      });
      console.log('✅ Template criado com sucesso!');
    } else {
      console.log('✅ Template já existe');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupEmail(); 