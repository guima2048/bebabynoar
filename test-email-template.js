const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testEmailTemplate() {
  try {
    console.log('🔍 Verificando template email-confirmation...');
    
    // Buscar template
    const emailTemplate = await prisma.emailTemplate.findUnique({
      where: { slug: 'email-confirmation' }
    });

    console.log('📧 Template encontrado:', {
      exists: !!emailTemplate,
      slug: emailTemplate?.slug,
      name: emailTemplate?.name,
      templateId: emailTemplate?.templateId,
      enabled: emailTemplate?.enabled
    });

    // Buscar configuração de email
    const emailConfig = await prisma.emailConfig.findFirst({ 
      orderBy: { createdAt: 'desc' } 
    });

    console.log('⚙️ Configuração de email:', {
      exists: !!emailConfig,
      from: emailConfig?.from,
      hasApiKey: !!emailConfig?.apiKey,
      apiKeyLength: emailConfig?.apiKey?.length
    });

    // Simular a condição do código
    const shouldSend = emailTemplate && 
                      emailTemplate.enabled && 
                      emailTemplate.templateId && 
                      emailConfig;

    console.log('✅ Condição para envio:', shouldSend);
    
    if (!shouldSend) {
      console.log('❌ Motivos para não enviar:');
      console.log('- Template existe:', !!emailTemplate);
      console.log('- Template habilitado:', emailTemplate?.enabled);
      console.log('- Template tem ID:', !!emailTemplate?.templateId);
      console.log('- Config existe:', !!emailConfig);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEmailTemplate(); 