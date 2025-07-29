// Verificar dados do template vs dados reais
const { PrismaClient } = require('@prisma/client');

async function checkTemplateData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 VERIFICANDO DADOS DO TEMPLATE');
    console.log('================================');
    
    // Buscar template
    const template = await prisma.emailTemplate.findUnique({
      where: { slug: 'email-confirmation' }
    });
    
    console.log('📋 Template encontrado:', {
      slug: template?.slug,
      name: template?.name,
      templateId: template?.templateId,
      enabled: template?.enabled,
      testEmail: template?.testEmail,
      testData: template?.testData
    });
    
    // Buscar configuração
    const config = await prisma.emailConfig.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('⚙️ Configuração:', {
      from: config?.from,
      hasApiKey: !!config?.apiKey
    });
    
    // Simular dados reais de um usuário
    const realUserData = {
      id: 'user123',
      email: 'usuario.real@example.com',
      name: null,
      username: 'usuario_real',
      birthdate: new Date('1990-01-01'),
      gender: 'MALE',
      userType: 'SUGAR_DADDY'
    };
    
    // Simular dados que seriam enviados para o SendGrid
    const verificationUrl = `http://localhost:3000/verify-email?token=abc123&email=${encodeURIComponent(realUserData.email)}`;
    const dynamicTemplateData = {
      nome: realUserData.name || realUserData.username,
      link_confirmacao: verificationUrl
    };
    
    console.log('👤 Dados reais do usuário:', realUserData);
    console.log('📧 Dados que seriam enviados para SendGrid:', {
      to: realUserData.email,
      from: config?.from,
      templateId: template?.templateId,
      dynamicTemplateData: dynamicTemplateData
    });
    
    // Verificar se os dados de teste estão sendo usados
    console.log('⚠️ PROBLEMA POTENCIAL:');
    console.log('- Template testData:', template?.testData);
    console.log('- Dados reais:', JSON.stringify(dynamicTemplateData));
    console.log('- Os dados de teste podem estar sendo usados em vez dos dados reais');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTemplateData(); 